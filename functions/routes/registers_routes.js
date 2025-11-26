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
    const registerId = req.params.register_id;

    // Validación del ID
    if (!registerId || registerId.trim() === "") {
      return res.status(400).json({message: "ID de registro requerido"});
    }

    // Validación de datos
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({message: "No hay datos para actualizar"});
    }

    const docRef = db.collection("registros").doc(registerId);
    const doc = await docRef.get();

    // Verificar que el documento existe antes de actualizar
    if (!doc.exists) {
      return res.status(404).json({
        message: "Registro no encontrado",
        id: registerId,
      });
    }

    // Actualizar el documento
    await docRef.update(data);

    // Obtener el documento actualizado para retornarlo
    const updatedDoc = await docRef.get();

    return res.status(200).json({
      message: "Registro actualizado exitosamente",
      id: registerId,
      data: updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error al actualizar el registro:", error);

    // Manejo específico para errores de Firestore
    if (error.code === "not-found" || error.code === 5) {
      return res.status(404).json({
        message: "Registro no encontrado",
        id: req.params.register_id,
      });
    }

    // Error de validación de Firestore
    if (error.code === "invalid-argument") {
      return res.status(400).json({
        message: "Datos inválidos para actualizar",
        error: error.message,
      });
    }

    // Error genérico
    return res.status(500).json({
      message: "Error al actualizar el registro",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
