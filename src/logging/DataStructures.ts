
class LinkedNode<T> {

  private _value: T;
  private _previous: LinkedNode<T> | null = null;
  private _next: LinkedNode<T> | null = null;

  constructor(value: T) {
    this._value = value;
  }

  get previous(): LinkedNode<T> | null {
    return this._previous;
  }

  set previous(value: LinkedNode<T> | null) {
    this._previous = value;
  }

  get next(): LinkedNode<T> | null {
    return this._next;
  }

  set next(value: LinkedNode<T> | null) {
    this._next = value;
  }

  get value(): T {
    return this._value;
  }
}

export class LinkedList<T> {

  private head: LinkedNode<T> | null = null;
  private size: number = 0;

  addHead(value: T): void {
    if(!this.createHeadIfNeeded(value)) {
      if(this.head != null) {
        const nextNode = this.head.next;
        const newHeadNode = new LinkedNode<T>(value);
        if (nextNode != null) {
          nextNode.previous = newHeadNode;
          newHeadNode.next = nextNode;
        }
        this.head = newHeadNode;
      }
      else {
        throw new Error("This should never happen, list implementation broken");
      }
    }
    this.size++;
  }

  addTail(value : T): void {
    if(!this.createHeadIfNeeded(value)) {
      const oldTailNode = this.getTailNode();
      if(oldTailNode != null) {
        const newTailNode = new LinkedNode<T>(value);
        oldTailNode.next = newTailNode;
        newTailNode.previous = oldTailNode;
      }
      else {
        throw new Error("List implementation broken");
      }
    }
    this.size++;
  }

  clear() {
    this.head = null;
    this.size = 0;
  }

  getHead(): T | null {
    if(this.head != null) {
      return this.head.value;
    }
    return null;
  }

  removeHead(): T | null {
    if(this.head != null) {
      const oldHead = this.head;
      const value = oldHead.value;
      this.head = oldHead.next;
      this.size --;
      return value;
    }
    return null;
  }

  getTail(): T | null {
    const node = this.getTailNode();
    if(node != null) {
      return node.value;
    }
    return null;
  }

  removeTail(): T | null {
    const node = this.getTailNode();
    if(node != null) {
      if(node === this.head) {
        this.head = null;
      }
      else {
        const previousNode = node.previous;
        if(previousNode != null) {
          previousNode.next = null;
        }
        else {
          throw new Error("List implementation is broken");
        }
      }
      this.size--;
      return node.value;
    }
    return null;
  }

  getSize(): number {
    return this.size;
  }

  filter(f: (value: T)=> boolean): T[] {
    const recurse = (f: (value: T)=> boolean, node: LinkedNode<T>, values: T[]) => {
      if(f(node.value)) {
        values.push(node.value);
      }

      const nextNode = node.next;
      if(nextNode != null) {
        recurse(f, nextNode, values);
      }
    };

    const result: T[] = [];
    const node = this.head;
    if(node != null) {
      recurse(f, node, result);
    }
    return result;
  }

  private createHeadIfNeeded(value: T): boolean {
    if(this.head == null) {
      this.head = new LinkedNode(value);
      return true;
    }
    return false;
  }

  private getTailNode(): LinkedNode<T> | null {
    if(this.head == null) {
      return null;
    }

    let node = this.head;
    while(node.next != null) {
      node = node.next;
    }

    return node;
  }
}

export class SimpleMap<V> {

  private array: { [key: string]: V | null } = {};

  put(key: string, value: V | null): void {
    if(value === undefined) {
      throw new Error("Undefined value is not allowed, null is.");
    }
    this.array[key] = value;
  }

  get(key: string): V | null {
    const value = this.array[key];
    if(value !== undefined) {
      return value;
    }
    return null;
  }

  exists(key: string): boolean {
    const value = this.array[key];
    return value !== undefined;

  }

  remove(key: string): V | null {
    const value = this.array[key];
    if(value !== undefined) {
      delete this.array[key];
    }
    return value;
  }

  keys(): string[] {
    const keys: string[] = [];
    for(let key in this.array) {
      // To prevent random stuff to appear
      if(this.array.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

  values(): (V | null)[] {
    const values: (V | null)[] = [];
    for(let key in this.array) {
      // To prevent random stuff to appear
      if(this.array.hasOwnProperty(key)) {
        values.push(this.get(key));
      }
    }
    return values;
  }

  size(): number {
    // Todo improve...
    return this.keys().length;
  }

  isEmpty(): boolean {
    return this.size() == 0;
  }

  clear(): void {
    this.array = {};
  }
}


export class TuplePair<X,Y> {

  private _x: X;
  private _y: Y;

  constructor(x: X, y: Y) {
    this._x = x;
    this._y = y;
  }

  get x(): X {
    return this._x;
  }

  set x(value: X) {
    this._x = value;
  }

  get y(): Y {
    return this._y;
  }

  set y(value: Y) {
    this._y = value;
  }
}



export class StringBuilder {

  private data: string[] = [];

  append(line : string): StringBuilder {
    if(line === undefined || line == null) {
      throw new Error("String must be set, cannot append null or undefined");
    }
    this.data.push(line);
    return this;
  }

  appendLine(line: string): StringBuilder {
    this.data.push(line + "\n");
    return this;
  }

  isEmpty(): boolean {
    return this.data.length == 0;
  }

  clear(): void {
    this.data = [];
  }

  toString(separator: string = ""): string {
    return this.data.join(separator);
  }
}