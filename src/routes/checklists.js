import { db } from "../firebase";
import { Router } from 'express';

const routerChecklist = Router();

// List Averias
routerChecklist.get('/', async (req, res) => {
  //   const salon = req.params.salon;
  //   const comunidad = req.params.comunidad;
  const detailsObject = [];
  console.log("salon")
  try {
    const querySnapshot = await db.collection("Checklist").listDocuments();
    for (const item of querySnapshot) {
      const data = await item.get();
      detailsObject.push({ ...data.data() });
    }
    // const detailsObject = querySnapshot.map((elem) => ({
    //   id: elem.id, ...elem.data()
    // }));
    res.send([...detailsObject]);
  } catch (error) {
    console.log(error);
  }
});
routerChecklist.post("/", async (req, res) => {
  const { comunidad, prioridad, fecha, detalles } = req.body;
  console.log({ comunidad, prioridad, fecha, detalles })
  await db.collection("Checklist").add({
    comunidad,
    prioridad,
    fecha,
    detalles,
  });
});


export default routerChecklist