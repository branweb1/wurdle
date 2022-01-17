import React, { Component } from 'react';

// TODO styling
// TODO expand wordlist and select some other way--network call?
// TODO configure to allow for 6-letter words
// render keyboard
const wordlist = [
  'about', 'there', 'could', 'every', 'about', 'story', 'begin', 'maybe', 'issue', 'whole', 'break', 'local',
  'value', 'movie', 'share', 'guess', 'enjoy', 'apply', 'river', 'stick', 'mouth', 'touch', 'judge', 'basic',
  'smile', 'apple', 'sales', 'smart', 'crowd', 'extra', 'focus', 'enemy', 'actor', 'topic', 'youth', 'grand',
  'angry', 'works', 'tooth', 'shift', 'guide', 'cycle', 'quote', 'knife', 'brief', 'shout', 'giant', 'slide',
  'giant', 'weigh', 'sauce', 'idiot', 'taste', 'stake', 'tiger', 'adapt', 'smell', 'humor', 'silly', 'guide'
]

// how to render keyboard
// we need the populated part of the guess matrix
// iterate through thouse and update the array of Letter
// never overriding the inOrder if it is true
// then render in querty order



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
      row.push(makeLetter('x'))
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

interface AppState {
  row: number;
  column: number;
  matrix: Letter[][];
  alphabet: Letter[];
  maxRows: number;
  maxColumns: number;
  word: string;
  won: boolean;
}


interface TileProps {
  letter: Letter;
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

function Tile(props: TileProps) {
  const { letter } = props;
  const className = selectLetterClassName(letter);
  return (
    <div className={`tile ${className}`}>
      {letter.letter}
    </div>
  )
}

interface KeyboardProps {
  letters: Letter[];
}

function Keyboard(props: KeyboardProps) {
  const { letters } = props;
  const querty = "qwertyuiopasdfghjklzxcvbnm".split('')
    .map(c => c.charCodeAt(0)).map(idx => letters[idx-'a'.charCodeAt(0)])
  return (
    <div>
      {
        querty.map(letter =>
          <span className={`key ${selectLetterClassName(letter)}`}>{letter.letter}</span>)
      }
    </div>
  )
}

class App extends Component<any, AppState> {
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
      maxColumns
    }

    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleKeyPress(e: KeyboardEvent) {
    console.log(e)
    let { matrix, row, column, maxColumns, alphabet } = this.state;
    if (column < maxColumns && isLetter((e.key.toLowerCase()))) {
      matrix[row][column].letter = e.key
      column++
      this.setState({
        matrix,
        row,
        column
      })
    } else if (column >= maxColumns-1 && e.keyCode === 13) {
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
    } else if (column > 0 && e.keyCode === 8) {
      matrix[row][column-1].letter = 'x'
      this.setState({
        ...this.state,
        matrix,
        column: this.state.column-1
      })
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
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
          {row.map(letter => <Tile letter={letter} />)}
        </div>
      )
    }

    return (
      <div className="app">
        {content}
        <Keyboard letters={this.state.alphabet} />
      </div>
    );
  }
}

export default App;
