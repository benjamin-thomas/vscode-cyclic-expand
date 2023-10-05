import { TextEditor, workspace } from 'vscode';
import { documentRippleScanner } from './documentRippleScanner';
import { tokenizer } from './tokenizer';
import { fuzzySearch } from './fuzzySearch';

export class CyclicExpand {
  private state: {
    needle: string;
    nextIterator: IterableIterator<boolean> | undefined;
    preventReset: boolean;
    discardedMatches: string[];
    activeMatchIndex: number;
    atEndOfMatches: boolean;
    isActive: boolean;
  };

  constructor() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.reset = this.reset.bind(this);

    this.state = {
      needle: '',
      nextIterator: undefined,
      preventReset: false,
      discardedMatches: [],
      activeMatchIndex: -1,
      atEndOfMatches: false,
      isActive: false,
    };
  }

  public reset() {
    if (!this.state || (this.state.preventReset !== true && this.state.isActive)) {
      this.state = {
        needle: '',
        nextIterator: undefined,
        preventReset: false,
        discardedMatches: [],
        activeMatchIndex: -1,
        atEndOfMatches: false,
        isActive: false,
      };
    }
  }

  public next(activeTextEditor: TextEditor) {
    this.state.isActive = true;

    // If we've navigated with prev then we have the result ready
    if (this.state.activeMatchIndex < this.state.discardedMatches.length - 1) {
      const token = this.state.discardedMatches[++this.state.activeMatchIndex];
      this.setMatch(token, activeTextEditor);
      return;
    }

    // Don't do anything at the end of results so we can use prev if we want
    if (this.state.atEndOfMatches) return;

    if (this.canAutocomplete(activeTextEditor)) {
      if (!this.state.nextIterator) {
        this.state.nextIterator = this.nextGenerator(activeTextEditor);
      }

      const nextResult = this.state.nextIterator.next();

      if (nextResult.done) {
        this.state.atEndOfMatches = true;
      }
    } else {
      this.reset();
    }
  }

  public prev(activeTextEditor: TextEditor) {
    this.state.isActive = true;

    if (this.canAutocomplete(activeTextEditor)) {
      if (this.state.activeMatchIndex > 0) {
        const token = this.state.discardedMatches[--this.state.activeMatchIndex];
        this.setMatch(token, activeTextEditor);
        return;
      }
    } else {
      this.reset();
    }
  }

  private canAutocomplete(activeTextEditor: TextEditor) {
    const { selection, document } = activeTextEditor;
    const wordRange = document.getWordRangeAtPosition(selection.end);

    if (
      wordRange === undefined ||
      wordRange.end.character !== selection.end.character ||
      selection.start.line !== selection.end.line ||
      selection.start.character !== selection.end.character
    ) {
      return false;
    } else {
      return true;
    }
  }

  private *nextGenerator(activeTextEditor: TextEditor) {
    this.setNeedle(activeTextEditor);

    if (!this.state.needle) {
      return;
    }

    const { document, selection } = activeTextEditor;
    const documentIterator = documentRippleScanner(document, selection.end.line);
    for (const line of documentIterator) {
      const wordSeparators = workspace.getConfiguration().editor.wordSeparators;
      const tokensIterator = tokenizer(line.text, wordSeparators);

      for (const token of tokensIterator) {
        if (
          fuzzySearch(this.state.needle, token) &&
          this.state.discardedMatches.indexOf(token) === -1
        ) {
          this.state.discardedMatches.push(token);
          this.state.activeMatchIndex = this.state.discardedMatches.length - 1;
          this.setMatch(token, activeTextEditor);
          yield true;
        }
      }
    }
  }

  private setNeedle(activeTextEditor: TextEditor) {
    const { document, selection } = activeTextEditor;
    const needle = document.getText(document.getWordRangeAtPosition(selection.end));

    if (typeof needle === 'string') {
      this.state.discardedMatches.push(needle);
      this.state.needle = needle;
    }
  }

  private async setMatch(match: string, activeTextEditor: TextEditor) {
    const { selections, document } = activeTextEditor;

    // Start from last selection so that edits don't alter the locations of previous selections
    for (let i = selections.length - 1; i >= 0; i--) {
      const selection = selections[i];
      const wordRange = document.getWordRangeAtPosition(selection.end);

      if (wordRange) {
        this.state.preventReset = true;

        await activeTextEditor.edit(editBuilder => {
          editBuilder.delete(wordRange);
          editBuilder.insert(selection.end, match);
        });

        this.state.preventReset = false;
      }
    }
  }
}
