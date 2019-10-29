import * as stream from 'stream';


type ErrorCallback = (error?: Error | null) => void;



// ========================================================================================
//    Writable
// ========================================================================================

export interface WritableOptions<T> extends Omit<stream.WritableOptions, 'write' | 'writev' |   'objectMode' | 'decodeStrings'> {
    write?(  chunk: T, _encoding: string, callback: (error: Error | null) => void ): void;
    writev?( dataList: Array<{ chunk: T, encoding: string }>, callback: ErrorCallback): void;
}


// Writable have not `pipe` method implemented but original nodeJS typings includes it so it should be removed
export interface Writable<T> extends Omit<stream.Writable, 'write' | '_write' | '_writev' | '_destroy' | '_final' |   'pipe'> {

    // Methods to override (with extra typings)
    _write?(chunk: T, _encoding: string, callback: ErrorCallback): void;
    _writev?(dataList: Array<{ chunk: T, encoding: string }>, callback: ErrorCallback): void;
    _destroy?(error: Error | null, callback: ErrorCallback): void;
    _final?(callback: ErrorCallback): void;
}

export class Writable<T> extends (stream.Writable as any) {

    constructor(opts?: WritableOptions<T>) {

        let fullOpts: stream.WritableOptions = opts || {} as any;

        fullOpts.objectMode = true;
        fullOpts.decodeStrings = false;

        super(fullOpts);
    }


    // ============================ public methods with modified signature ===============================

    // In objectMode there is no encoding so only this signature supported
    write(chunk: T, cb?: ErrorCallback): boolean {
        return super.write(chunk, cb);
    }
}


// ========================================================================================
//    Readable
// ========================================================================================

export interface ReadableOptions<T> extends Omit<stream.ReadableOptions, 'read' |   'objectMode' | 'encoding'> {
    // In objectMode it will always return 1 object per call (or null if no objects)
    read?(this: Readable<T>): void;
}



export interface Readable<T> extends Omit<stream.Readable, 'push' | 'read' | 'pipe' | '_read' | '_destory' > {

    // Methods to override (to avoid compilation error)
    _read(): void;
    _destroy(error: Error | null, callback: (error: Error | null) => void): void;
}

export class Readable<T> extends (stream.Readable as any) {
    constructor(opts?: ReadableOptions<T>) {
        let fullOpts: stream.ReadableOptions = opts || {} as any;
        fullOpts.objectMode = true;
        super(fullOpts);
    }


    // ============================ public methods with modified signature ===============================

    push(chunk: null | T): boolean {
        return super.push(chunk);
    }

    // In objectMode it will always returns null or single object, regardless of size arguments (so that's why it is removed)
    read(): null | T {
        return super.read();
    }

    pipe<TReturn extends (Writable<T> | Duplex<T, TReturn>)>(destination: Writable<T>, options?: { end?: boolean; }): TReturn {
        return super.pipe(destination, options);
    }
}



// ========================================================================================
//    Duplex
// ========================================================================================

export interface DuplexOptions<TWrite, TRead> extends Omit<stream.DuplexOptions, 'write' | 'writev' | 'read' | 'final' | 'destroy' |   'readableObjectMode' | 'writableObjectMode' |   'objectMode' | 'decodeStrings' | 'encoding'> {
    read?(this: Duplex<TWrite, TRead>, size: number): void;
    write?(this: Duplex<TWrite, TRead>, chunk: TWrite, encoding: string, callback: (error?: Error | null) => void): void;
    writev?(this: Duplex<TWrite, TRead>, chunks: Array<{ chunk: TWrite, encoding: string }>, callback: (error?: Error | null) => void): void;
    final?(this: Duplex<TWrite, TRead>, callback: (error?: Error | null) => void): void;
    destroy?(this: Duplex<TWrite, TRead>, error: Error | null, callback: (error: Error | null) => void): void;
}


export interface Duplex<TWrite, TRead> extends Omit<stream.Duplex, 'write' | '_write' | '_writev' | '_destroy' | '_final' |   'push' | 'read' | 'pipe' | '_read' | '_destory'> {
    // Methods to override (with extra typings)
    _write?(chunk: TWrite, _encoding: string, callback: ErrorCallback): void;
    _writev?(dataList: Array<{ chunk: TWrite, encoding: string }>, callback: ErrorCallback): void;
    _destroy?(error: Error | null, callback: ErrorCallback): void;
    _final?(callback: ErrorCallback): void;
    _read(): void;
}

export class Duplex<TWrite, TRead> extends (stream.Duplex as any) {

    constructor(opts: DuplexOptions<TWrite, TRead> = {}) {
        let fullOpts: stream.DuplexOptions = opts as any;
        fullOpts.objectMode = true;
        fullOpts.writableObjectMode = true;
        fullOpts.readableObjectMode = true;
        fullOpts.decodeStrings = false;
        super(fullOpts);
    }


    // ====================== Writable ======================

    write(chunk: TWrite, cb?: (error: Error | null | undefined) => void): boolean {
        return super.write(chunk, cb)
    }


    // ====================== Readable ======================

    push(chunk: null | TRead): boolean {
        return super.push(chunk);
    }

    // In objectMode it will always returns null or single object, regardless of size arguments (so that's why it is removed)
    read(): null | TRead {
        return super.read();
    }

    pipe(destination: Writable<TWrite>, options?: { end?: boolean; }): Readable<TRead> {
        return super.pipe(destination, options);
    }
}



export type TransformCallback<TOut> = (error?: Error | null, data?: TOut) => void;

export interface TransformOptions<TWrite, TRead> extends Omit<stream.TransformOptions, 'transform' | 'flush' |    'readableObjectMode' | 'writableObjectMode' |   'objectMode' | 'decodeStrings' | 'encoding'> {
    transform?(this: Transform<TWrite, TRead>, chunk: TWrite, encoding: string, callback: TransformCallback<TRead>): void;
    flush?(this: Transform<TWrite, TRead>, callback: TransformCallback<TRead>): void;
}

export interface Transform<TWrite, TRead> extends Omit<stream.Transform, '_transform' | '_flush' | 'push' | 'read' | 'pipe' | 'write'> {
    _transform?(this: Transform<TWrite, TRead>, chunk: any, encoding: string, callback: TransformCallback<TRead>): void;
    _flush?(this: Transform<TWrite, TRead>, callback: TransformCallback<TRead>): void;
};

export class Transform<TWrite, TRead> extends (stream.Transform as any) {
    constructor(opts: TransformOptions<TWrite, TRead> = {}) {
        let fullOpts: stream.TransformOptions = opts as any;
        fullOpts.objectMode = true;
        fullOpts.writableObjectMode = true;
        fullOpts.readableObjectMode = true;
        super(fullOpts);
    }


    // ====================== Readable ======================

    push(chunk: null | TRead): boolean {
        return super.push(chunk);
    }

    // In objectMode it will always returns null or single object, regardless of size arguments (so that's why it is removed)
    read(): null | TRead {
        return super.read();
    }

    pipe(destination: Writable<TWrite>, options?: { end?: boolean; }): Readable<TRead> {
        return super.pipe(destination, options);
    }


    // ====================== Writable ======================

    write(chunk: TWrite, cb?: (error: Error | null | undefined) => void): boolean {
        return super.write(chunk, cb)
    }
}



// ========================================================================================
//    PassThrough
// ========================================================================================

export interface PassThrough<T> extends Transform<T, T> {}
export class PassThrough<T> extends (stream.PassThrough as any) {}


// let source      = new Readable< {code: number} >();
// let pass1 =  new PassThrough<{code: number} >();
// let transform: Writable<{code: number}>   = new Duplex< {code: number}, {message: string}   >();
// let pass2 =  new PassThrough<{message: string}>();
// let dest        = new Writable< {message: string} >();

// source
//     .pipe(pass1)
//     .pipe(transform)
//     .pipe(pass2)
//     .pipe(dest);

// source
//     .pipe(transform)
//     .pipe(dest);
