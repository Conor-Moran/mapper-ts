export function main() {
    map(source, fieldMap);
};

const source = {
    oper: {
        isMain: true,
        givenName: 'Jim',
        familyName: 'Beam',
        numbers: [
            123,
            234
        ]
    }
}

function deflate(obj: { [x: string]: any; }, prefix = ''): { [x: string]: any;  } {
    return Object.keys(obj).reduce((acc, k) => {
        let fieldPrefix = '';
        if (prefix.length) {
            fieldPrefix = `${prefix}.`;
        }
        if (isNestedObj(obj[k])) Object.assign(acc, deflate(obj[k], fieldPrefix + k));
        else acc[fieldPrefix + k] = obj[k];
        return acc;
    }, {} as { [x: string]: any; });
}

function isNestedObj(obj: any) {
    return !Array.isArray(obj) && obj === Object(obj);
}

function inflate(obj: { [x: string]: any; }, prefix = '') {
    const inflated: { [x: string]: any; } = {};
    Object.keys(obj).forEach((fieldPath: string) => {
        const fields = fieldPath.split('.');
        let referencedObj = inflated;
        fields.forEach((field, index) => {
            if (index + 1 === fields.length) {
                let valueToUse = obj[fieldPath];
                if (Array.isArray(valueToUse)) {
                    const arr = [...valueToUse];
                    valueToUse = arr;
                }
                referencedObj[field] = valueToUse;
            } else if (!referencedObj[field]) {
                referencedObj[field] = {};
            }
            referencedObj = referencedObj[field];
        });
    });
    return inflated;
}

class Person {
    constructor(
        private firstName: string,
        private lastLast: string,
        private nums: number
      ) {}
}

const fieldMap: [string, string][] = [
    ['oper.givenName', 'debtorAcc.agent.firstName'],
    ['oper.familyName', 'debtorAcc.agent.lastName'],
    ['oper.numbers', 'debtorAcc.agent.nums'],
];

function map(obj: any, fieldMap: [string, string][]) {
    const deflatedSrc = deflate(obj);
    const deflatedTarget: { [x: string]: any; } = {};
    fieldMap.forEach( mapping => {
        deflatedTarget[mapping[1]] = deflatedSrc[mapping[0]];
    });
    console.log(obj);
    console.log(deflatedSrc);
    console.log(deflatedTarget);
    const mapped = inflate(deflatedTarget);
    console.log(mapped);
}