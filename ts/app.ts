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
};

function flatten(obj: { [x: string]: any; }, prefix = ''): { [x: string]: any;  } {
    return Object.keys(obj).reduce((acc, k) => {
        const accT = acc as { [x: string]: any; };
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object') Object.assign(acc, flatten(obj[k], pre + k));
        else accT[pre + k] = obj[k];
        return acc;
    }, {});
};

function inflate(obj: { [x: string]: any; }, prefix = '') {
    const inflated: { [x: string]: any; } = {};
    Object.keys(obj).forEach((fieldPath: string) => {
        const fields = fieldPath.split('.');
        let referencedObj = inflated;
        fields.forEach((field, index) => {
            if (index + 1 === fields.length) {
                referencedObj[field] = obj[fieldPath];
            } else if (!referencedObj[field]) {
                referencedObj[field] = {};
            }
            referencedObj = referencedObj[field];
        });
    });
    return inflated;
};

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
    ['oper.numbers.[]', 'debtorAcc.agent.nums[]'],
];

function map(obj: any, fieldMap: [string, string][]) {
    const flattenedSrc = flatten(obj);
    const flattenedTarget: { [x: string]: any; } = {};
    fieldMap.forEach( mapping => {
        flattenedTarget[mapping[1]] = flattenedSrc[mapping[0]];
    });
    console.log(inflate(flattenedTarget));

}