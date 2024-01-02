const express = require('express');
const mysql = require('mysql');
const axios = require('axios');
const readline = require('readline');

const app = express();
const port = 3006;

// Kết nối với MySQL
const connection = mysql.createConnection({
  host: '172.17.0.2',
  user: 'root',
  password: 'Hoang.123456',
  database: 'custom_profile',
  port: 31174,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  setInterval(() => fetchUrls('Malicious'), 5 * 60 * 1000);
  setInterval(() => fetchUrls('Fishing'), 5 * 60 * 1000);
  setInterval(() => fetchUrls('Pup'), 5 * 60 * 1000);
  setInterval(() => fetchUrls('Tracking'), 5 * 60 * 1000);
  setInterval(() => fetchUrls('Vnbadsite'), 5 * 60 * 1000);

  fetchUrls('Malicious');
  fetchUrls('Fishing');
  fetchUrls('Pup');
  fetchUrls('Tracking');
  fetchUrls('Vnbadsite');
});

async function fetchUrls(type) {
  try {
    let url;
    switch (type) {
      case 'Malicious':
        url = 'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-dnscrypt-blocked-names.txt';
        break;
      case 'Fishing':
        url = 'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-dnscrypt-blocked-names.txt';
        break;
      case 'Pup':
        url = 'https://malware-filter.gitlab.io/pup-filter/pup-filter.txt';
        break;
      case 'Tracking':
          url = 'https://curbengh.github.io/tracking-filter/tracking-data.txt';
          break;
      case 'Vnbadsite':
          url = 'https://curbengh.github.io/vn-badsite-filter/vn-badsite-filter-dnscrypt-blocked-names.txt';
          break;
      default:
        console.error('Unknown type:', type);
        return;
    }

    const response = await axios.get(url);
    
    const lines = response.data.split('\n');
    const urls = [];

    for (const line of lines) {
      if (line.trim() !== '' && !line.startsWith('#')) {
        urls.push([line.trim()]);
      }
    }
    const tableName = `${type}Url`; 
    const sqldrop = `DROP TABLE ${tableName}`;
    connection.query(sqldrop, (err, results) => {
      if (err) {
        console.error(`Error Drop data ${tableName} table:`, err);
      }
    });
    const sql = `INSERT INTO ${tableName} (domain) VALUES ?`;
    connection.query(sql, [urls], (err, results) => {
      if (err) {
        console.error(`Error inserting data into ${tableName} table:`, err);
      }
    });
  } catch (error) {
    console.error(`Error fetching ${type} URLs:`, error.message);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
