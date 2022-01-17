import React, { Component } from 'react';

// TODO styling
// board height is some multiple of 6, tile height is bh / 6, and tile width is the same
// TODO expand wordlist and select some other way--network call?
// TODO configure to allow for 6-letter words
const wordlist = [
  'about', 'there', 'could', 'every', 'about', 'story', 'begin', 'maybe', 'issue', 'whole', 'break', 'local',
  'value', 'movie', 'share', 'guess', 'enjoy', 'apply', 'river', 'stick', 'mouth', 'touch', 'judge', 'basic',
  'smile', 'apple', 'sales', 'smart', 'crowd', 'extra', 'focus', 'enemy', 'actor', 'topic', 'youth', 'grand',
  'angry', 'works', 'tooth', 'shift', 'guide', 'cycle', 'quote', 'knife', 'brief', 'shout', 'giant', 'slide',
  'giant', 'weigh', 'sauce', 'idiot', 'taste', 'stake', 'tiger', 'adapt', 'smell', 'humor', 'silly', 'guide'
]

const enter = '↵'
const backspace = '⌫'


function getWord(words: string[]): string {
  const idx = Math.floor(Math.random() * words.length);
  return words[idx];
}

interface Letter {
  letter: string;
  inOrder: boolean;
  inWord: boolean;
  used: boolean;
}

function makeLetter(letter: string) {
  return {
    letter,
    inOrder: false,
    inWord: false,
    used: false
  } 
}

function initMatrix(rows: number, cols: number): Letter[][] {
  const matrix = []
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push(makeLetter(' '))
    }
    matrix.push(row)
  }
  return matrix
}

function initAlphabet(): Letter[] {
  const letters = []
  for (let i = 0; i < 26; i++) {
    letters[i] = {
      letter: String.fromCharCode('a'.charCodeAt(0) + i),
      inOrder: false,
      inWord: false,
      used: false
    }
  }
  return letters
}

function isLetter(str: string): boolean {
  return str.length === 1 && /[a-z]/.test(str)
}

function gradeWord(word: string, guess: Letter[]): Letter[] {
  for (let i = 0; i < word.length; i++) {
    for (let j = 0; j < guess.length; j++) {
      if (guess[j].letter === word[i]) {
        guess[j].inWord = true
        if (i === j) {
          guess[j].inOrder = true
        }
      }
      guess[j].used = true
    }
  }
  return guess;
}

function checkWin(guess: Letter[]): boolean {
  for (let i = 0; i < guess.length; i++) {
    if (!guess[i].inWord) {
      return false;
    }
  }
  return true;
}

function selectLetterClassName(letter: Letter): string {
  let className = '';
  
  if (letter.inOrder) {
    className = 'in-order'
  } else if (letter.inWord) {
    className = 'in-word'
  } else if (letter.used) {
    className = 'used'
  }

  return className;
}

interface TileProps {
  letter: Letter;
  height: number;
}

function Tile(props: TileProps) {
  const { letter, height } = props;
  const className = selectLetterClassName(letter);
  return (
    <div style={{height, width: height }} className={`tile ${className}`}>
      <div className='text-node'>{letter.letter}</div>
    </div>
  )
}

interface KeyboardProps {
  letters: Letter[];
  handleTouch: (e: React.TouchEvent) => void;
}

function Keyboard(props: KeyboardProps) {
  const { letters, handleTouch } = props;

  const indices = "qwertyuiop|asdfghjkl|zxcvbnm|"
    .split('').map(c => c.charCodeAt(0) - 'a'.charCodeAt(0))

  const keyboard: Letter[][] = [];
  let keyrow: Letter[] = [];
  indices.forEach(index => {
    if (index === 27) {
      keyboard.push(keyrow)
      keyrow = []
    } else {
      if (keyboard.length === 2 && keyrow.length === 0) {
        keyrow.push(makeLetter(enter));
      }
      keyrow.push(letters[index])
    }
  })
  keyboard[keyboard.length-1].push(makeLetter(backspace))

  return (
    <div className='keyboard'>
      {
        keyboard.map(keyrow =>
          <div className='keyrow'>
            {keyrow.map(kbkey =>
              <span onTouchEnd={handleTouch} className={`key ${selectLetterClassName(kbkey)}`}>
              {kbkey.letter}
              </span>)}
          </div>
        )
      }
    </div>
  )
}

interface AppState {
  row: number;
  column: number;
  matrix: Letter[][];
  alphabet: Letter[];
  maxRows: number;
  maxColumns: number;
  word: string;
  won: boolean;
  tileWidth: number;
}

class App extends Component<any, AppState> {
  private ref: React.RefObject<HTMLDivElement>;
  constructor(props: any) {
    super(props)
    const maxRows = 6
    const maxColumns = 5
    this.state = {
      matrix: initMatrix(maxRows,maxColumns),
      alphabet: initAlphabet(),
      row: 0,
      column: 0,
      word: getWord(wordlist),
      won: false,
      maxRows,
      maxColumns,
      tileWidth: 0
    }
    this.ref = React.createRef()
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleTouch = this.handleTouch.bind(this)
  }

  helper(key: string, keycode: number) {
    let { matrix, row, column, maxColumns, alphabet } = this.state;
    if (column < maxColumns && isLetter((key))) {
      matrix[row][column].letter = key
      column++
      this.setState({
        matrix,
        row,
        column
      })
    } else if (column >= maxColumns-1 && keycode === 13) {
      // grade and move to next row
      matrix[row] = gradeWord(this.state.word, this.state.matrix[this.state.row])
      
      for (let i = 0; i <= row; i++) {
         for (let j = 0; j < column; j++) {
           const index = matrix[i][j].letter.charCodeAt(0) - 'a'.charCodeAt(0)
           const letter = alphabet[index];
           if (!letter.inOrder) {
             alphabet[index] = {...matrix[i][j]}
           }
        }
      }
      this.setState({
        ...this.state,
        matrix,
        alphabet: [...alphabet],
        row: this.state.row+1,
        column: 0,
        won: checkWin(matrix[row])
      })
    } else if (column > 0 && keycode === 8) {
      matrix[row][column-1].letter = ' '
      this.setState({
        ...this.state,
        matrix,
        column: this.state.column-1
      })
    }    
  }

  handleTouch(e: React.TouchEvent) {
    const key = e.currentTarget.textContent || '';
    let keycode = key.charCodeAt(0)
    if (key === enter) {
      keycode = 13
    } else if (key === backspace) {
      keycode = 8
    }
    this.helper(key, keycode)
  }

  handleKeyPress(e: KeyboardEvent) {
    console.log(e)
    this.helper(e.key.toLowerCase(), e.keyCode)
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress)
    const boardWidth = this.ref.current?.offsetWidth
    console.log(boardWidth)
    const tileWidth = boardWidth ? boardWidth / 5 - 20: 0
    this.setState({
      ...this.state,
      tileWidth
    })
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress)
  }

  render() {
    const gameOver: boolean = this.state.row >= this.state.maxRows

    let content;

    if (this.state.won) {
      content = <div>u won</div>
    } else if (gameOver) {
      content = <div>game over u lame. word wuz {this.state.word}</div>
    } else {
      content = this.state.matrix.map(row =>
        <div className="row">
          {row.map(letter => <Tile letter={letter} height={this.state.tileWidth} />)}
        </div>
      )
    }

    return (
      <div className="app" ref={this.ref}>
        <h1>wurdle</h1>
        {content}
        <Keyboard letters={this.state.alphabet} handleTouch={this.handleTouch} />
      </div>
    );
  }
}

export default App;
