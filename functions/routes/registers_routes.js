const express = require("express");
// Allow express.Router() even though Router is capitalized
// eslint-disable-next-line new-cap
const router = express.Router();
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

router.post("/api/registers", async (req, res) => {
  try {
    const data = req.body || {};
    const docId = data && data.context && data.context.chat_id;

    if (docId) {
      await db.collection("registros").doc(docId).set(data);
      return res.status(200).json({message: "Registro creado", id: docId});
    }

    const ref = await db.collection("registros").add(data);
    return res.status(200).json({message: "Registro creado", id: ref.id});
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Error al crear el registro"});
  }
});

router.get("/api/registers", async (req, res) => {
  try {
    const query = db.collection("registros");
    const querySnapshot = await query.get();
    const docs = querySnapshot.docs;

    const response = docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res
        .status(500)
        .json({message: "Error al encontrar los registros"});
  }
});

router.get("/api/registers/:register_id", async (req, res) => {
  try {
    const doc = db.collection("registros").doc(req.params.register_id);
    const item = await doc.get();
    const response = item.data();
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Error al crear el registro"});
  }
});

router.delete("/api/registers/:register_id", async (req, res) => {
  try {
    const doc = db.collection("registros").doc(req.params.register_id);
    await doc.delete();
    return res.status(200).json({message: "Registro eliminado"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Error al eliminar el registro"});
  }
});

router.put("/api/registers/:register_id", async (req, res) => {
  try {
    const data = req.body || {};
    const doc = db.collection("registros").doc(req.params.register_id);
    await doc.set(data);
    return res.status(200).json({message: "Registro actualizado"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Error al actualizar el registro"});
  }
});

module.exports = router;
