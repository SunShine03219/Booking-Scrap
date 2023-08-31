import puppeteer, { Page } from "puppeteer";
import { JSDOM } from "jsdom";
import { existsSync, readFileSync, writeFileSync } from "fs";

interface Hotel {
    name: string;
    address: string;
    review: number;
    phone?: string;
}

const keywords = [
    'Gramado, Rio Grande do Sul, Brazil',
    'Parati, Rio de Janeiro State, Brazil',
    'Fernando de Noronha, Pernambuco, Brazil',
    'São Paulo, São Paulo State, Brazil',
    'Rio de Janeiro, Rio de Janeiro State, Brazil',
    'Fortaleza, Ceará, Brazil',
    'Porto Seguro, Bahia, Brazil',
    'Arraial D’Ajuda, Bahia, Brazil',
    'Trancoso, Bahia, Brazil',
    'Itacaré, Bahia, Brazil',
    'Visconde de Mauá, Rio de Janeiro State, Brazil',
    'Garopaba, Santa Catarina, Brazil',
    'Ilhéus, Bahia, Brazil',
    'Monte Verde, Minas Gerais, Brazil',
    'Campos do Jordão, São Paulo, Brazil',
    'São Sebastião, São Paulo, Brazil',
    'Ubatuba, São Paulo, Brazil',
    'Brasília, Distrito Federal, Brazil',
    'Caldas Novas, Goiás, Brazil',
    'Salvador, Bahia, Brazil',
    'Búzios, Rio de Janeiro State, Brazil',
    'Itaipava, Rio de Janeiro State, Brazil',
    'Teresópolis, Rio de Janeiro State, Brazil',
    'Petrópolis, Rio de Janeiro State, Brazil',
    'Curitiba, Paraná, Brazil',
    'Santos, São Paulo State, Brazil',
    'Belém, Pará, Brazil',
    'Recife, Pernambuco, Brazil',
    'Porto de Galinhas, Pernambuco, Brazil',
    'Florianópolis, Santa Catarina, Brazil',
    'Maceió, Alagoas, Brazil',
    'Bombinhas, Santa Catarina, Brazil',
    'Cabo Frio, Rio de Janeiro State, Brazil',
    'Guarujá, São Paulo State, Brazil',
    'Balneário Camboriú, Santa Catarina, Brazil',
    'Natal, Rio Grande do Norte, Brazil',
    'Arraial do Cabo, Rio de Janeiro State, Brazil',
    'Canela, Rio Grande do Sul, Brazil',
    'Ilhabela, São Paulo State, Brazil',
    'Penha, Santa Catarina, Brazil',
    'Pipa, Rio Grande do Norte, Brazil',
    'Barreirinhas, Maranhão, Brazil',
    'São Luís, Maranhão, Brazil',
    'Jericoacoara, Jijoca de Jericoacoara, Ceará, Brazil'
]

const exportToExcel = (data: Hotel[]) => {

}

const defaultConfig = {
    timeout: 60000
}

const main = async () => {
    const browser = await puppeteer.launch({
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list'
        ],
        // headless: "new",
        devtools: true
    });
    const pages = await browser.pages();
    const page2 = await browser.newPage();
    const page: Page = (await browser.pages())[0];
    let response = await page.goto("https://booking.com", {
        waitUntil: "load",
        timeout: 0
    });

    const gotoSearchPage = async () => {
        const cookieAcceptButton = await page.waitForSelector("#onetrust-accept-btn-handler");
        await cookieAcceptButton?.click();
        const keywordInput = await page.waitForSelector("input[name=ss]");
        await keywordInput?.type("Gramado, RioGrande do Sul, Brazil");
        const autoCompleteDropdown = await page.waitForSelector("[data-testid=autocomplete-results] > li:nth-child(1) > div > div", defaultConfig);
        await autoCompleteDropdown?.click();
        const dateSelector = await page.waitForSelector("#indexsearch > div.hero-banner-searchbox > div > div > form > div.ffa9856b86.db27349d3a.cc9bf48a25 > div:nth-child(2) > div > div");
        await dateSelector?.click();
        const submitButton = await page.waitForSelector("#indexsearch > div.hero-banner-searchbox > div > div > form > div.ffa9856b86.db27349d3a.cc9bf48a25 > div:nth-child(4) > button");
        await submitButton?.click();
        await page.waitForNavigation();
    }


    const waitForLoadingOverlayDisappear = async () => {
        try {
            await page.waitForSelector('div[data-testid="overlay-card"]');
        } catch (error) {

        }
        try {
            await page.waitForSelector('div[data-testid="overlay-card"]', {
                hidden: true,
                timeout: 600000
            });
        } catch (error) {

        }
    }

    const waitForSignInfoDisappear = async () => {
        try {
            const closeBtn = await page.waitForSelector('button[aria-label="Dismiss sign-in info."]', {
                timeout: 500
            });
            await closeBtn?.click();
        } catch (error) {

        }
        try {
            await page.waitForSelector('button[aria-label="Dismiss sign-in info."]', {
                hidden: true
            });
        } catch (error) {

        }
    }

    const inputKeywordAndSubmit = async (keyword: string) => {
        const keywordInput = await page.waitForSelector("input[name=ss]");
        await waitForSignInfoDisappear();
        const inputValue = await page.$eval('input[name=ss]', el => el.value);
        await keywordInput?.click();
        for (let i = 0; i < inputValue.length; i++) await page.keyboard.press("Backspace");
        for (let i = 0; i < inputValue.length; i++) await page.keyboard.press("Delete");
        await keywordInput?.type(keyword);
        const autoCompleteDropdown = await page.waitForSelector("[data-testid=autocomplete-results] > li:nth-child(1) > div > div", defaultConfig);
        await waitForSignInfoDisappear();
        await autoCompleteDropdown?.click();
        try {
            const dateSelector = await page.waitForSelector('[data-testid="datepicker-tabs"]', {
                timeout: 1000
            });
            const inputDiv = await page.waitForSelector('[data-testid="searchbox-dates-container"]');
            await inputDiv?.click();
        } catch (error) {

        }
        try {
            const submitButton = await page.waitForSelector('div[data-component="arp-searchbox"] button[type=submit]', {
                timeout: 1000
            });
            await waitForSignInfoDisappear();
            await submitButton?.click();
        } catch (error) {
            const submitButton = await page.waitForSelector('div[data-capla-namespace="b-search-web-searchresultsaYYXUCRM"] button[type=submit]');
            await waitForSignInfoDisappear();
            await submitButton?.click();
        }

        await page.waitForNavigation(defaultConfig);
        const hotelFilter = await page.waitForSelector('div[data-filters-item="ht_id:ht_id=204"]', defaultConfig)
        await hotelFilter?.click();
        await page.waitForResponse(response => {
            return response.url().includes('booking.com');
        }); // 
        await waitForLoadingOverlayDisappear();
    }

    const findResult = async (exist: Hotel[]): Promise<Hotel[]> => {
        const findTotal = async () => {
            const el = await page.waitForSelector("#search_results_table > div:nth-child(2) > div > div > div:nth-child(4) > div:nth-child(1)");
            const text = (await el?.getProperty("innerHTML"))?.toString() || "";
            const arr = text.split(": ")?.[1]?.trim()?.split(' ');
            const n = arr?.[0];
            return Number(n) || 0;
        }
        const clickNext = async () => {
            const nextBtn = await page.waitForSelector('[aria-label="Next page"]');
            await waitForSignInfoDisappear();
            await nextBtn?.click();
            await waitForLoadingOverlayDisappear();
        }
        const n = await findTotal();
        const getResult = async () => {
            const res: Hotel[] = [];
            const par = await page.waitForSelector("#search_results_table > div:nth-child(2) > div > div > div.d4924c9e74");
            const innerHTML = await par?.getProperty("innerHTML");
            let domSTR = innerHTML?.toString() || "";
            var doc = new JSDOM(domSTR);
            const items: Element[] = [];
            doc.window.document.querySelectorAll("div[data-testid=property-card]").forEach(async (item) => {
                items.push(item);
            });
            for (let i = 0; i < items.length; i++) {
                try {
                    console.log(`${items.length} / ${i + 1} started`);
                    const start = new Date();
                    const item = items[i];
                    const name = item.querySelector("div[data-testid=title]")?.innerHTML || "";
                    const found = exist.find(ho => ho.name == name);
                    const review = (item.querySelector("[data-testid=review-score] > div:nth-child(1)")?.innerHTML || "").replace(" reviews", "").replace(",", "").replace(" ", "");
                    if(found) {
                        found.review = Number(review);
                        if(!res.find(ho => ho.name == name)) res.push(found);
                        const end = new Date();
                        // @ts-ignore
                        console.warn(`${i+1} finished with exist ${end - start}`);
                        continue;
                    }
                    const titleHref = item.querySelector("a[data-testid=title-link")?.getAttribute("href") || "";
                    try {
                        await page2.goto(titleHref, {
                            timeout: 1000
                        });
                    } catch (error) {

                    }
                    const locationEl = await page2.waitForSelector('[data-node_tt_id="location_score_tooltip"]', {
                        timeout: 60000
                    });
                    let location = (await locationEl?.getProperty("innerHTML"))?.toString() || "";
                    location = location.substring(10, location.length - 1);
                    // #search_results_table > div:nth-child(2) > div > div > div.d4924c9e74 > div:nth-child(4) > div.d20f4628d0 > div.b978843432 > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > a > span > div > div:nth-child(2) > div:nth-child(2)
                    
                    res.push({
                        name,
                        review: Number(review) || 0,
                        address: location,
                    });
                    exist.push({
                        name,
                        review: Number(review) || 0,
                        address: location,
                    })
                    const end = new Date();
                    // @ts-ignore
                    console.log(`${i+1} finished ${end - start}`);
                } catch (error) {

                }
            }
            return res;
        };
        const res: Hotel[] = [];
        let c = n;
        while (c > 0) {
            try {
                console.log(c);
                (await getResult()).map(item => res.push(item));
                c -= 25;
                if (c > 0) {
                    await clickNext();
                    console.log("next button clicked");
                } 
            } catch (error) {
                
            }
        }
        return res;
    }

    await gotoSearchPage();
    await waitForSignInfoDisappear();
    const retJson: any = {};
    for (let i = 0; i < keywords.length; i++) {
        try {
            let exist: Hotel[] = [];
            if(existsSync(`output/${keywords[i]}.json`)) {
                exist = JSON.parse(readFileSync(`output/${keywords[i]}.json`).toString())
            }
            await inputKeywordAndSubmit(keywords[i]);
            let res = await findResult(exist);
            res = res.sort((a, b) => b.review - a.review);
            // res = res.reverse();
            retJson[keywords[i]] = res;
            writeFileSync(`output/${keywords[i]}.json`, JSON.stringify(res));
        } catch (error) {
            console.log(keywords[i], error);
        }
    }
    writeFileSync("output/total.json", JSON.stringify(retJson));
    console.log("done");
}
main();