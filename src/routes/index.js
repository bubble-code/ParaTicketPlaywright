const { db } = require("../firebase");
const { chromium } = require('playwright')

const { Router, text } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("users").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
  }
});


router.post("/new-contact", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  await db.collection("contacts").add({
    firstname,
    lastname,
    email,
    phone,
  });
  res.redirect("/");
});

router.get("/delete-contact/:id", async (req, res) => {
  await db.collection("contacts").doc(req.params.id).delete();
  res.redirect("/");
});

router.get("/edit-contact/:id", async (req, res) => {
  const doc = await db.collection("contacts").doc(req.params.id).get();
  res.render("index", { contact: { id: doc.id, ...doc.data() } });
});

router.post("/update-contact/:id", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  const { id } = req.params;
  await db
    .collection("contacts")
    .doc(id)
    .update({ firstname, lastname, email, phone });
  res.redirect("/");
});
// -----------------------------------------------------------------------------
// Modulo Add Salones
// -----------------------------------------------------------------------------
router.get("/add-salones", async (req, res) => {
  try {
    const querySnapshot = await db.collection("salones").doc("Comunidades").collection("Madrid").doc('Salones').listCollections();
    const salones = querySnapshot.map((coll) => ({
      id: coll.id
    }));
    res.render("AddSalon", { salones });
    console.log({ salones });
  } catch (error) {
    console.error(error);
  }
})

  // -----------------------------------------------------------------------------
  // Modulo Scraping Averias
  // -----------------------------------------------------------------------------

  ; (async () => {
    const browser = await chromium.launch({ headless: false });
    const content = await browser.newContext({
      ignoreHTTPSErrors: true
    });
    const page = await content.newPage();
    await page.goto('http://otrs.dosniha.eu/osticket/scp/login.php');
    // Fill [placeholder="e-mail o nombre de usuario"]
    await page.fill('[placeholder="e-mail o nombre de usuario"]', 'Madrid');
    // Fill [placeholder="Contraseña"]
    await page.fill('[placeholder="Contraseña"]', 'madrid');
    // Click text=Inicia sesión
    await Promise.all([
      page.waitForNavigation(/*{ url: 'http://otrs.dosniha.eu/osticket/scp/index.php' }*/),
      page.click('text=Inicia sesión')
    ]);
    // Click th >> nth=0
    await page.locator('th').first().click();
    const list = await page.locator('.list');
    console.log(list);
    // await browser.close()
  })()




module.exports = router;
