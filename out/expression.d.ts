export declare enum ExpressionTypes {
    Binary = 0,
    Constant = 1,
    Member = 2,
    Method = 3,
    Table = 4,
    Unary = 5,
    Order = 6
}
declare abstract class Expression {
    private _type;
    constructor(type: ExpressionTypes);
    get type(): ExpressionTypes;
    abstract toString(): string;
}
export declare class ConstantExpression<T> extends Expression {
    _value: T;
    text: string;
    constructor(value: T);
    get value(): T;
    set value(value: T);
    toString(): string;
}
export declare class MemberExpression extends Expression {
    private _name;
    private _expression;
    private text;
    constructor(name: string, source?: Expression);
    get expression(): Expression;
    get name(): string;
    toString(): any;
}
export declare class BinaryExpression extends Expression {
    private _operator;
    private _rightExpression;
    private _leftExpression;
    private text;
    constructor(op: string, left: Expression, right: Expression);
    get leftExpression(): Expression;
    get rightExpression(): Expression;
    get operator(): string;
    toString(): any;
}
export declare class MethodCallExpression extends Expression {
    private args;
    private method;
    private text;
    constructor(method: string, args: Expression[]);
    toString(): string;
}
declare type SortType = 'desc' | 'asc';
export declare class OrderExpression extends Expression {
    private member;
    private text;
    private _sortType;
    constructor(member: MemberExpression, sortType: SortType);
    get sortType(): SortType;
    toString(): string;
}
export declare class Parser {
    private textPos;
    private ch;
    private textLen;
    private text;
    private token;
    private tokenText;
    private functions;
    private constants;
    private constructor();
    static parseExpression(text: string): Expression;
    static parseOrderExpression(text: string): OrderExpression;
    private setTextPos;
    private isLetter;
    private isDigit;
    private nextChar;
    private nextToken;
    private parsePrimaryStart;
    private validateToken;
    private parseIntegerLiteral;
    private parseParenExpression;
    private parseStringLiteral;
    private parseFunction;
    private parseIdentifier;
    private parsePrimary;
    private parseUnary;
    private parseMultiplicative;
    private parseLogicalOr;
    private parseLogicalAnd;
    private parseComparison;
    private parseAdditive;
    private parseExpression;
    private _parseRealLiteral;
    parse(): Expression;
}
export {};
