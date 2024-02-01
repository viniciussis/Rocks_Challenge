const express = require("express");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

async function getAuthSheets() {
  // Create authentication client using credentials.json file
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Obtain client instance
  const client = await auth.getClient();

  // Create Google Sheets API instance
  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  // Spreadsheet ID for the target Google Sheet
  const spreadsheetId = "14lZ5NBwJya97BvEZAOTXKsBTXrbNPWW-2KMbSD9DRk0";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

/* Logging a message to indicate the server is running and provides instructions for updating student situations */
app.get("/", async (req, res) => {
  console.log("The server is running");
  res
    .status(200)
    .send(
      "The server is running, go to the endpoint: http://localhost:3001/updateSituation"
    );
});

/* 
It's important to mention that, in terms of RESTful best practices, the use of GET requests is generally associated with read operations and not server-side modifications. However, for the purpose of automatic triggering, I used GET.
*/
app.get("/updateSituation", async (req, res) => {
  // Retrieve necessary objects from getAuthSheets function
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  try {
    // Fetch data from the "engenharia_de_software" sheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "engenharia_de_software",
    });

    // Extract rows from the fetched data
    const rows = getRows.data.values;

    // Check if the data is valid
    if (!rows || rows.length < 3) {
      throw new Error("Invalid data retrieved from the spreadsheet");
    }

    // Iterate through rows starting from index 3 (4th row)
    for (let i = 3; i < rows.length; i++) {
      // Parse values from the row
      const absences = parseInt(rows[i][2]);
      const p1 = parseInt(rows[i][3]);
      const p2 = parseInt(rows[i][4]);
      const p3 = parseInt(rows[i][5]);

      // Check for invalid numeric data
      if (isNaN(absences) || isNaN(p1) || isNaN(p2) || isNaN(p3)) {
        throw new Error("Invalid numeric data in the spreadsheet");
      }

      // Calculate the average
      const average = (p1 + p2 + p3) / 3 / 10;

      // Update row based on conditions
      rows[i][7] = 0;
      if (absences > 0.25 * 60) {
        rows[i][6] = "Reprovado por Falta";
      } else if (average < 5) {
        rows[i][6] = "Reprovado por Nota";
      } else if (average < 7) {
        rows[i][6] = "Exame Final";
        rows[i][7] = Math.ceil(10 - average); //The formula ensures that the final grade (m + naf) / 2 is at least 5, following mathematical principles.
      } else {
        rows[i][6] = "Aprovado";
      }
    }

    // Update the sheet with the modified rows
    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: "engenharia_de_software",
      valueInputOption: "RAW",
      resource: { values: rows },
    });

    // Log success message and send response to the client
    console.log(
      "Student situation updated successfully. Go to the google sheets!"
    );
    res.status(200).send("Student situation updated successfully");
  } catch (error) {
    // Log error message and send internal server error response
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server on port 3001
app.listen(3001, () =>
  console.log(
    "The server is running on port 3001. Go to the endpoint: http://localhost:3001/updateSituation"
  )
);
