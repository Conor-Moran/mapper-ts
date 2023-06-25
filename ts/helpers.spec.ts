import { setFlatField } from "./helpers";

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

});
