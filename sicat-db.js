const { Pool } = require('pg');

const pool = new Pool({
  user: 'db_user',
  host: 'localhost',
  database: 'd4pdf_rcm',
  password: 'db_user!si-cat',
  port: 5432,
});

exports.getCell = (cellType, lat, lon) => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE celltype = $1
      AND ST_COVERS(geog, ($2::GEOMETRY)::GEOGRAPHY)
    LIMIT 1;
  `;
  return pool.query(query, [cellType, `POINT(${lon} ${lat})`])
    .then(res => res.rows[0])
    .catch(e => console.error(e.stack));
};

exports.getCells = cellType => {
  const query = `
    SELECT *
    FROM m_cell
    WHERE celltype = $1
  `;
  return pool.query(query, [cellType])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getExperiments = () => {
  const query = `
    SELECT *
    FROM m_experiment
  `;
  return pool.query(query)
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getSimulations = experimentId => {
  const query = `
    SELECT *
    FROM m_simulation
    WHERE experimentid = $1
    ORDER BY ensembleno
  `;
  return pool.query(query, [experimentId])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getDatetimes = (startDateString, stopDateString) => {
  const query = `
    SELECT *
    FROM m_datetime
    WHERE $1::TIMESTAMP <= datetime
      AND datetime < $2::TIMESTAMP
    ORDER BY datetime
  `;
  return pool.query(query, [startDateString, stopDateString])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};

exports.getRains = (cellId, startDateString, stopDateString) => {
  const query = `
  SELECT *
  FROM sd_rain JOIN m_datetime ON sd_rain.datetimeid = m_datetime.id
  WHERE sd_rain.cellid = $1
    AND $2::TIMESTAMP <= m_datetime.datetime
    AND m_datetime.datetime < $3::TIMESTAMP
  ORDER BY simulationid, m_datetime.datetime
  `;
  return pool.query(query, [cellId, startDateString, stopDateString])
    .then(res => res.rows)
    .catch(e => console.error(e.stack));
};