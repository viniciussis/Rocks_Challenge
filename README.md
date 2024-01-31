# Rocks_Challenge
Tunts Rocks Dev Training Challenge

## Student Situation Updater
This Node.js project utilizes the Express framework and Google Sheets API to update the academic situation of students based on their attendance, grades, and calculated averages. The script reads data from a specified Google Sheet, performs calculations, and updates the sheet with the final results.

### Setup
Before running the project, make sure you have the following prerequisites:

#### Google API Credentials:
1. Create a project on the Google Cloud Console.
2. Enable the Google Sheets API for your project.
3. Create credentials and download the JSON file. Rename it to `credentials.json` and place it in the root directory of the project.

#### Node.js and npm:
- Make sure you have Node.js and npm installed on your machine.

### Install Dependencies:
Open a terminal in the project's root directory and run:

```bash
npm install
```

### Configure Spreadsheet
Open index.js and replace the spreadsheetId variable with the ID of your target Google Sheet.

## Running the Project
To start the server, run the following command in the terminal:

```bash
npm start
```

The server will run on port 3001. Access it by navigating to http://localhost:3001 in your browser.

## API Endpoint
POST /updateSituation:
This endpoint triggers the update of student situations in the specified Google Sheet. The sheet's structure is assumed to have relevant data starting from the 4th row. The script calculates averages, updates approval status, and adds a final grade (if applicable).

### Important Notes
- Ensure the Google Sheet contains valid and consistent data, and its structure matches the assumptions made in the script.
- Any errors encountered during the process will be logged to the console and result in a 500 Internal Server Error response.
- Feel free to modify the script or adapt it to your specific use case. If you encounter any issues, refer to the error messages in the console for troubleshooting.

## How to Get in Touch

I'm always open to chat and collaborate on interesting projects. You can reach out to me through the following channels:

- Email: vinicius01012@gmail.com
- LinkedIn: [https://www.linkedin.com/in/_viniciussis](URL)
- GitHub: [https://github.com/viniciussis](URL)

Feel free to contact me if you have any questions, ideas, or collaboration opportunities!

## Contributing

Feel free to contribute or open issues for suggestions and bug fixes. Pull requests are welcome!

## License

This project is licensed under the [MIT License](LICENSE).

---
**Developed by Vinícius Silva Santos in partnership with Tunts Rocks**
