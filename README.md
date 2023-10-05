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

Cycling in a "ripple" fashion is a bit odd. In the future, I'd like to mimic JetBrain's hippy completion which goes like this:

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

## Development

To work an the extension, go to the "Run and Debug" menu, then run "Launch Extension".