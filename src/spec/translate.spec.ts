import * as translators from "../utils/translators";
import * as nock from "nock";
import { expect } from "chai";


describe('translation cli tests', () => {
    it('should handle umlaut correctly for DeepL', async () => {
        const langauge = 'de';
        const deeplApiKEy = "fafasfasfaff320fj23f0jfjf";
        const german = [
            "Herzlich willkommen &&& vielen Dank, dass Sie mich besucht haben, meine Mitstudenten und Bürger!"
        ];
        const english = [
            "Welcome &&& thank you for visiting me, my fellow students and citizens!"];
        const data = {
            text: english
        };
        nock("https://api.deepl.com").post(`/v2/translate`).query({ text:english[0], target_lang: langauge }).reply(200, {
            translations: [{ text: german[0] }]
        });

        const result = await translators.translateSayNode(data, 'de', 'deepl', deeplApiKEy);

        expect(result.text[0], "umlauts should be correctly parsed").to.eql(german[0])
    })
});