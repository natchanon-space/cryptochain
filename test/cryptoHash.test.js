const cryptoHash = require("../utils/cryptoHash");

describe("cryptoHash()", () => {
    it("generates a SHA-256 output", () => {
        const data = "foo-data";

        expect(cryptoHash(data))
            .toEqual("18607ec682de99e51e240f198d473b59b542e8926b815004d746a0435919454b");
    });

    it("produces the same hash with the same arguments in any order", () => {
        expect(cryptoHash(1, 2, 3, 4)).toEqual(cryptoHash(4, 2, 3, 1));
    });
});