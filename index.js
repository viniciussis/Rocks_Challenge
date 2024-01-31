const express = require("express");
const req = require("express/lib/request");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "14lZ5NBwJya97BvEZAOTXKsBTXrbNPWW-2KMbSD9DRk0";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.get("/metadata", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  try {
    const metadata = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    res.send(metadata.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao requisitar dados!");
  }
});

app.get("/getRows", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "engenharia_de_software",
    });
    res.send(getRows.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao requisitar dados!");
  }
});

app.get("/getRow/:rowNumber", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const rowNumber = req.params.rowNumber;
  const range = `engenharia_de_software!A${rowNumber}:Z${rowNumber}`;

  try {
    const getRow = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: range,
    });

    res.send(getRow.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao requisitar dados!");
  }
});

app.get("/getCells/:rowNumber", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const rowNumber = req.params.rowNumber;
  const range = `engenharia_de_software!D${rowNumber}:F${rowNumber}`;

  try {
    const getCells = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: range,
    });

    const values = getCells.data.values[0]; // Obtém os valores da primeira (e única) linha

    if (!values || values.length < 3) {
      res.status(500).send("Não há dados suficientes para calcular a média.");
      return;
    }

    // Converte os valores para números e calcula a média
    const numericValues = values.map(parseFloat);
    const average =
      numericValues.reduce((acc, val) => acc + val, 0) /
      (numericValues.length * 10);
    const roundedAverage = parseFloat(average.toFixed(2));

    res.send({ values: numericValues, average: roundedAverage });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao requisitar dados!");
  }
});

app.post("/updateSituation", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  try {
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "engenharia_de_software",
    });

    const rows = getRows.data.values;

    for (let i = 1; i < rows.length; i++) {
      const faltas = parseInt(rows[i][2]);
      const p1 = parseInt(rows[i][3]);
      const p2 = parseInt(rows[i][4]);
      const p3 = parseInt(rows[i][5]);

      const media = (p1 + p2 + p3) / 3;

      if (faltas > 0.25 * 60) {
        rows[i][6] = "Reprovado por Falta";
        rows[i][7] = "";
      } else if (media < 5) {
        rows[i][6] = "Reprovado";
        rows[i][7] = "";
      } else if (media >= 5 && media < 7) {
        rows[i][6] = "Final";
        rows[i][7] = "";
      } else {
        rows[i][6] = "Aprovado";
        rows[i][7] = "";
      }
    }

    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: "engenharia_de_software",
      valueInputOption: "RAW",
      resource: { values: rows },
    });

    res.send("Situação atualizada com sucesso.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao atualizar a situação.");
  }
});

app.listen(3001, () => console.log("Rodando na porta 3001"));
