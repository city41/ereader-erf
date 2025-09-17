export type Token = {
  value: string;
  isStringLiteral: boolean;
};

const whitespace = /\s+/;
const validToken = /\S+/;

export class Tokenizer {
  index = 0;
  length: number;
  stringMode = false;

  constructor(private input: string) {
    this.length = this.input.length;
  }

  skipWhitespace() {
    while (whitespace.test(this.input[this.index]) && this.index < length) {
      this.index++;
    }
  }

  // Does input have these characters at this index?
  hasCharsAtIndex(tokens: string, startIndex: number) {
    for (let i = 0; i < tokens.length; i++) {
      if (this.input[startIndex + i] != tokens[i]) {
        return false;
      }
    }
    return true;
  }

  processString() {
    let value = "";
    this.index += 3; // skip over ." and space
    while (this.input[this.index] !== '"' && this.index < length) {
      value += this.input[this.index];
      this.index++;
    }
    this.index++; // skip over final "
    return value;
  }

  processParenComment() {
    this.index += 2; // skip over ( and space
    while (this.input[this.index] !== ")" && this.index < length) {
      this.index++;
    }

    this.index++; // skip over final )
  }

  processNormalToken() {
    let value = "";
    while (validToken.test(this.input[this.index]) && this.index < length) {
      value += this.input[this.index];
      this.index++;
    }
    return value;
  }

  getNextToken(): Token | null {
    this.skipWhitespace();
    const isStringLiteral = this.hasCharsAtIndex('." ', this.index);
    const isParenComment = this.hasCharsAtIndex("( ", this.index);
    const isSlashComment = this.hasCharsAtIndex("\\ ", this.index);

    let value: string | null = "";

    if (isStringLiteral) {
      value = this.processString();
    } else if (isParenComment) {
      this.processParenComment();
      return this.getNextToken(); // ignore this token and return the next one
    } else if (isSlashComment) {
      value = null;
    } else {
      value = this.processNormalToken();
    }

    if (!value) {
      return null;
    }

    return {
      value,
      isStringLiteral,
    };
  }

  nextToken(): Token | null {
    return this.getNextToken();
  }

  requiredNextToken(): Token {
    const token = this.getNextToken();
    if (token === null) {
      throw new Error("Tokenizer#requiredNextToken: token was null");
    }

    return token;
  }
}
