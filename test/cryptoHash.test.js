const { cryptoHash } = require("../utils");

describe("cryptoHash()", () => {
    it("generates a SHA-256 output", () => {
        const data = "foo-data";

        // running through JSON.stringify(...)
        expect(cryptoHash(data))
            .toEqual("dcb2a770bbb67b2fdec827d6000f019eff363c92c18bfb46254927d87b42d261");
    });

    it("produces the same hash with the same arguments in any order", () => {
        expect(cryptoHash(1, 2, 3, 4)).toEqual(cryptoHash(4, 2, 3, 1));
    });

    it("produces a unique hash whne the properties have changed on input", () => {
        // NOTE: two references to the same object in JS are always going to be treated as equal
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo["a"] = "a";

        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });
});