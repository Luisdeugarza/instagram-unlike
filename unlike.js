const UNLIKE_BATCH_SIZE = () => Math.floor(Math.random() * 15) + 8; // batch size 8-22 
const delay = (min, max) => new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
);

const waitForElement = async (selector, timeout = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const el = document.querySelector(selector);
        if (el) return el;
        await delay(80, 150);
    }
    throw new Error(`Element "${selector}" not found within ${timeout}ms`);
};

const clickElement = async (element) => {
    if (!element) throw new Error("Element not found");
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    await delay(200, 600); 
    element.click();
};

const waitForSelectButton = async () => {
    const MAX_RETRIES = 60;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const selectSpan = [...document.querySelectorAll("span")]
            .find(el => el.textContent.trim().toLowerCase() === "select");
        if (selectSpan) return;
        await delay(800, 1400);
    }
    throw new Error("Select button not found after waiting");
};

const unlikeSelectedItems = async () => {
    try {
        const unlikeButton = [...document.querySelectorAll("span")]
            .find(el => el.textContent.trim() === "Unlike");
        if (!unlikeButton) throw new Error("Unlike button not found");
        await clickElement(unlikeButton);
        await delay(1200, 2200);
        const confirmButton = await waitForElement('button[tabindex="0"]');
        await clickElement(confirmButton);
    } catch (err) {
        console.error("Error while unliking:", err.message);
    }
};

const scrollAndWaitForMoreItems = async (previousCount) => {
    window.scrollTo(0, document.body.scrollHeight);
    for (let i = 0; i < 10; i++) {
        await delay(900, 1500);
        const currentCount = document.querySelectorAll('[aria-label="Toggle checkbox"]').length;
        if (currentCount > previousCount) return true;
    }
    return false;
};

const removeLikes = async () => {
    try {
        let batchCount = 0;
        while (true) {
            const selectSpan = [...document.querySelectorAll("span")]
                .find(el => el.textContent.trim().toLowerCase() === "select");
            if (!selectSpan) throw new Error("Select button not found");
            await clickElement(selectSpan.parentElement);
            await delay(1800, 3000);

            const checkboxes = document.querySelectorAll('[aria-label="Toggle checkbox"]');
            if (checkboxes.length === 0) {
                const loaded = await scrollAndWaitForMoreItems(0);
                if (!loaded) {
                    console.log("No more items to unlike.");
                    break;
                }
                continue;
            }

            await delay(1500, 2500);

            const batchSize = UNLIKE_BATCH_SIZE();
            for (let i = 0; i < Math.min(batchSize, checkboxes.length); i++) {
                await clickElement(checkboxes[i]);
                await delay(80, 250); // delay variable between checkboxes

                // simulating human delay
                if (Math.random() < 0.08) {
                    console.log("⏸️ Pausa larga aleatoria entre 4k y 9k ms...");
                    await delay(4000, 9000);
                }
            }

            await delay(1000, 2000);
            await unlikeSelectedItems();
            await delay(1500, 2800);
            await waitForSelectButton();

            batchCount++;
            console.log(`✅ Batch ${batchCount} completado (${batchSize} unlikes)`);

            // each ~5 batches, rest is larger
            if (batchCount % 5 === 0) {
                const rest = Math.floor(Math.random() * 8000) + 7000;
                console.log(` Descansando ${(rest/1000).toFixed(1)}s para no levantar sospechas...`);
                await delay(rest, rest + 3000);
            } else {
                await delay(1200, 2500);
            }
        }
    } catch (err) {
        console.error("Error in removeLikes:", err.message);
    }
};

(async () => {
    console.log("🚀 Iniciando Instagram Unlike Script (modo humano)...");
    await removeLikes();
    console.log("✅ Terminado. Todos los likes eliminados.");
})();
