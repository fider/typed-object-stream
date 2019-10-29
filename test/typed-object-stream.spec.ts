import '../src/typed-object-stream';
import { Readable, Transform, Writable } from '../src/typed-object-stream';
const deepcopy = require('deepcopy');




test('Basic pipe', async (done) => {
    const input = [1, 2, 3, 4, 5];
    const expectedOutput = ['odd', 'even', 'odd', 'even', 'odd'];
    const output: string[] = [];

    let source = from(input);
    let modify = number2parityString();
    let dest = writeString(output);


    source.pipe(modify).pipe(dest);


    dest.on('finish', () => {
        expect(expectedOutput).toEqual(output);
        done();
    });
});



function from<T>(input: T[]) {
    input = deepcopy(input);
    return new Readable<T>({
        read() {
            this.index = this.index | 0;
            let data = input[this.index] || null;
            this.index++;
            this.push(data);
        }
    });
}

function number2parityString() {
    return new Transform<Number, String>({
        transform(chunk: number, _enc: any, cb) {
            let result = chunk % 2  ?  'odd' : 'even';
            cb(null, result);
        }
    });
}

function writeString(output: string[]) {
    return new Writable<String>({
        write(chunk: string, _enc: any, cb) {
            output.push(chunk);
            cb(null);
        }
    });
}