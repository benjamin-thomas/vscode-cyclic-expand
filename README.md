# Cyclic Expand / Hippie completion for vscode

I ripped this from this unmaintained package: https://github.com/msafi/xvsc/tree/master/simpleAutocomplete

The differences with this version are as follows:

- the completion is case **sensitive**
- it's possible to cycle backwards (thanks [@stagas](https://github.com/stagas))

## Usage

Add this to your `keybindings.json` file:

```
{
  "key":     "alt+/",
  "command": "cyclicExpand.next"
},
{
  "key": "shift+alt+/",
  "command": "cyclicExpand.prev"
}
```

Here's how the cycling works:

Given this text:

```
mist
milk
m<CURSOR_HERE>
mild
mystery
```

Cycling next will march in a "ripple" fashion, as such:

```
m > milk > mild > mist > mystery
```

Cycling backwards is only available after having advanced in the ripple completion, like this:

```
# If you stopped cycling at mystery
mystery > mist > mild > milk > m

# If you stopped cycling at mist
mist > mild > milk > m

# If you stopped cycling at mild
mild > milk > m

# If you stopped cycling at milk
milk > m

# If you haven't cycled since moving your cursor
m --> nothing happens
```

## Improvements

1 - Cycling in a "ripple" fashion is a bit odd. In the future, I'd like to mimic JetBrain's hippy completion which goes like this:

Given this text:

```
mist
milk
m<CURSOR_HERE>
mild
mystery
```

Cycling next:

```
m > milk > mist
```

Cycling prev (next reversed):


```
m > mild > mystery
```

---

2 - The test setup is in a half broken state. See this for later upgrades.

See:

> The [vscode](https://github.com/microsoft/vscode-extension-vscode) module had been the default way of running extension integration tests and is being superseded by [@vscode/test-electron](https://github.com/microsoft/vscode-test).

https://code.visualstudio.com/api/working-with-extensions/testing-extension

---

3 - I should bundle the assets

Right now, I publish including my node_modules. Doing otherwise will cause the extension to fail loading (because 
`escape-string-regexp` is absent). let's say it's less than ideal!

See: https://code.visualstudio.com/api/working-with-extensions/bundling-extension

## Development

To work on the extension, go to the "Run and Debug" menu, then run "Launch Extension".

## Release

See: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

- bump version in `package.json`
- vsce package
- generate a new token
- vsce login benjamin-thomas
- vsce publish


To generate a new token:

- connect to https://dev.azure.com/bgthomas/
  - authenticate via my GitHub account
    - settings -> personal access token -> new token
      - name: whatever
      - org: all organizations
      - expiry : short
      - scope : leave custom defined
      - click show more scopes
        - marketplace -> manage
        - click the create btn

See: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

Then monitor the publishing status here: https://marketplace.visualstudio.com/manage/publishers/benjamin-thomas


## Debugging

If something goes wrong, make sure to open the following vscode menu: 

```
Help > Toggle Developer Tools
```
