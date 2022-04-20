import { db } from "../firebase";
import { Router } from 'express';

const routerChecklist = Router();

// List Averias
routerChecklist.get('/', async (req, res) => {
  //   const salon = req.params.salon;
  //   const comunidad = req.params.comunidad;
  console.log("salon")
  try {
    const querySnapshot = await db.collection("Checklist").listDocuments();
    console.log(querySnapshot.length)
    const detailsObject = querySnapshot.map((elem) => ({
      id: elem.id
    }));
    res.send({ detailsObject });
  } catch (error) {
    console.log(error);
  }
});
// // Todas las Averias
// routerAverias.get('/:comunidad', async (req, res) => {
//   const salon = req.params.salon;
//   const comunidad = req.params.comunidad;
//   const resAverias = [];
//   try {
//     const querySnapshot = await db.collection("salones").doc(comunidad).collection("Salones").listDocuments();
//     for (const salon of querySnapshot) {
//       const averiasSalon = await salon.collection("Averias").listDocuments();
//       for (const averia of averiasSalon) {
//         const data = await averia.get();
//         resAverias.push({ salon: salon.id, ...data.data() });
//       }
//     }
//     // Promise.allSettled(querySnapshot.map(async (elem) => await elem.collection("Averias").listDocuments()))
//     //   .then(e => { console.log(e.length) })
//     // console.log(result);
//     res.send([...resAverias]);
//   } catch (error) {
//     console.log(req.params.salon);
//   }
// });

export default routerChecklist