import { deflate, inflate, setFlatField } from "./helpers";

describe("Helpers", function() {

    it('should set simple value', function() {
        const obj = {};
        setFlatField('a.b.c', obj, 'x');

        expect(obj).toEqual(jasmine.objectContaining({
            a: {
                b: {
                    c: 'x'
                }
            }
        }));
    });

    it('should set simple value into array', function() {
        const obj = {};
        setFlatField('a[0]', obj, 'x');

        expect(obj).toEqual(jasmine.objectContaining({
            a: ['x'],
        }));
    });

    it('should set nested object into array', function() {
        const obj = {};
        setFlatField('a[0].b[0]', obj, 'x');

        expect(obj).toEqual(jasmine.objectContaining({
            a: [{
                b: ['x'],
            }]
        }));
    });


    it('should set handle deflate/inflate roundtrip', function() {
        const obj = {
            f1: [{
                g1: 'v1',
                g2: [{
                    h1: {
                        i1: 'v2',
                    }
                }]
            },
            'v1']
        };
        const deflated = deflate(obj);
        console.log(deflated);
        const inflated = inflate(deflate(obj));
        expect(inflated).toEqual(jasmine.objectContaining(obj));
    });

});
