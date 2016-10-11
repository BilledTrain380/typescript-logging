import {Category} from "./CategoryLogger";
import {StringBuilder, SimpleMap} from "./DataStructures";
import {LogLevel} from "./LoggerOptions";


export interface JSONType<T> {

  getValue(): T;
  toString(): string;

}

export type ArrayType = boolean | string | number | JSONObject;

abstract class JSONTypeImpl<T> implements JSONType<T> {

  private _value: T;

  constructor(value: T) {
    this._value = value;
  }

  getValue(): T {
    return this._value;
  }

  toString(): string {
    const value = this.getValue();
    if(value != null) {
      return value.toString();
    }
    return "null";
  }

}

class JSONBooleanType extends JSONTypeImpl<boolean> {

  constructor(value: boolean) {
    super(value);
  }
}

class JSONNumberType extends JSONTypeImpl<number> {

  constructor(value: number) {
    super(value);
  }

}

class JSONStringType extends JSONTypeImpl<string> {

  constructor(value: string) {
    super(value);
  }


  toString(): string {
    const value = this.getValue();
    if(value != null) {
      return JSON.stringify(value.toString());
    }
    return "null";
  }
}


class JSONObjectType extends JSONTypeImpl<JSONObject> {

  constructor(value: JSONObject) {
    super(value);
  }
}

class JSONArrayType extends JSONTypeImpl<JSONArray<ArrayType>> {

  constructor(value: JSONArray<ArrayType>) {
    super(value);
  }

  toString(): string {
    const value = this.getValue();
    if(value != null) {
      return value.toString();
    }
    return "null";
  }
}

class JSONNullType extends JSONTypeImpl<null> {

  constructor() {
    super(null);
  }

  toString(): string {
    return "null";
  }
}

class JSONTypeConverter {

  static toJSONType(value: ArrayType): JSONType<ArrayType> {
    if(value === null) {
      return new JSONNullType();
    }
    if(typeof value === "string") {
      return new JSONStringType(value);
    }
    if(typeof value === "number") {
      return new JSONNumberType(value);
    }
    if(typeof value === "boolean") {
      return new JSONBooleanType(value);
    }
    if(value instanceof JSONObject) {
      return new JSONObjectType(value);
    }
    throw new Error("Type not supported for value: " + value);
  }
}


export class JSONObject {

  private values: SimpleMap<JSONTypeImpl<any>> = new SimpleMap<JSONTypeImpl<any>>();

  addBoolean(name: string, value: boolean): JSONObject {
    this.checkName(name);
    this.checkValue(value);
    this.values.put(name, new JSONBooleanType(value));
    return this;
  }

  addNumber(name: string, value: number): JSONObject {
    this.checkName(name);
    this.checkValue(value);
    this.values.put(name, new JSONNumberType(value));
    return this;
  }

  addString(name: string, value: string): JSONObject {
    this.checkName(name);
    this.checkValue(value);
    this.values.put(name, new JSONStringType(value));
    return this;
  }

  addNull(name: string): JSONObject {
    this.checkName(name);
    this.values.put(name, new JSONNullType());
    return this;
  }

  addArray(name: string, array: JSONArray<ArrayType>): JSONObject {
    this.checkName(name);
    this.checkValue(array);
    if(array == null) {
      throw new Error("Cannot add array as null");
    }
    this.values.put(name, new JSONArrayType(array));
    return this;
  }

  addObject(name: string, object: JSONObject): JSONObject {
    this.checkName(name);
    this.checkValue(object);
    if(object == null) {
      throw new Error("Cannot add object as null");
    }
    this.values.put(name, new JSONObjectType(object));
    return this;
  }

  toString(pretty: boolean=false): string {
    let comma = false;
    const buffer = new StringBuilder();
    buffer.append("{");
    this.values.keys().forEach((key: string) => {
      if(comma) {
        buffer.append(",");
      }
      const value = this.values.get(key);
      buffer.append('"').append(key).append('":').append(value.toString());
      comma = true;
    });
    buffer.append("}");
    return buffer.toString();
  }

  private checkName(name: string): void {
    if(name == null || name === undefined) {
      throw new Error("Name is null or undefined");
    }
    if(this.values.exists(name)) {
      throw new Error("Name " + name + " is already present for this object");
    }
  }

  private checkValue(value: any): void {
    if(value === undefined) {
      throw new Error("Value is undefined");
    }
  }
}

export class JSONArray<T extends ArrayType> {

  private objects: JSONType<ArrayType>[] = [];

  add(object: T): JSONArray<T> {
    if(object === undefined) {
      throw new Error("Object is not allowed to be undefined");
    }
    this.objects.push(JSONTypeConverter.toJSONType(object));
    return this;
  }

  toString(pretty: boolean=false): string {
    const buffer = new StringBuilder();
    buffer.append("[");
    this.objects.forEach((value: JSONType<T>, index: number) => {
      if(index > 0) {
        buffer.append(",");
      }
      buffer.append(value.toString());
    });
    buffer.append("]");

    return buffer.toString();
  }
}



/**
 * Utility class that helps us convert things to and from json (not for normal usage).
 */
export class JSONHelper {

  static categoryToJSON(cat: Category, recursive: boolean): JSONObject {
    /*
    {
     "categories":
     [
       { id=1,
         name: "x",
         parent: null,
         logLevel: "Error"
       },
       { id=2,
         name: "y",
         parent: 1,
         logLevel: "Error"
       }
     ]
   }
   */

    const arr = new JSONArray<JSONObject>();
    JSONHelper._categoryToJSON(cat, arr, recursive);
    const object = new JSONObject();
    object.addArray("categories", arr);
    return object;
  }

  private static _categoryToJSON(cat: Category, arr: JSONArray<JSONObject>, recursive: boolean): void {
    const object = new JSONObject();
    object.addNumber("id", cat.id);
    object.addString("name", cat.name);
    object.addString("logLevel", LogLevel[cat.logLevel].toString());
    if(cat.parent != null) {
      object.addNumber("parent", cat.parent.id);
    }
    else {
      object.addNull("parent");
    }

    arr.add(object);

    if(recursive) {
      cat.children.forEach((child: Category) => {
        JSONHelper._categoryToJSON(child, arr, recursive);
      });
    }
  }

}