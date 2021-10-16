import * as translators from "../utils/translators";
import * as nock from "nock";
import { expect } from "chai";


describe('translation cli tests', () => {
    it('should handle umlaut correctly for DeepL', async () => {
        const langauge = 'de';
        const deeplApiKEy = "fafasfas-faff320f-j23f1131-1330jfjf";
        const german = [
            "Herzlich willkommen &&& vielen Dank, dass Sie mich besucht haben, meine Mitstudenten und Bürger! Wir werden mit den Öffentlichen reisen."
        ];
        const english = [
            "Welcome &&& thank you for visiting me, my fellow students and citizens! We will travel via public transport."];
        const data = {
            text: english
        };
        nock("https://api.deepl.com", {
            reqheaders: {
                "Authorization": `DeepL-Auth-Key ${deeplApiKEy}`,
                "Accept": "*/*",
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            }
        })
            .post(`/v2/translate`)
            .query({ text: english[0], target_lang: langauge })
            .reply(200, {
                translations: [{ text: german[0] }]
            });

        const result = await translators.translateSayNode(data, 'de', 'deepl', deeplApiKEy);

        expect(result.text[0], "umlauts should be correctly parsed").to.eql(german[0]);
    })
});