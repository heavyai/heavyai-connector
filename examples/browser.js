/* eslint-disable */

window.connection = null
const autologin = false
const sample_query =
  "SELECT name, ST_Area(omnisci_geo) as val FROM omnisci_counties;"
const defaultQueryOptions = {}
const defaultConnection = {
  hostname: "192.168.10.110",
  useHTTPS: true,
  port: "6278",
  database: "omnisci",
  username: "admin",
  password: "HyperInteractive"
};

/* 
  Connect Modal 
*/
function hideConnectModal() {
  $('#connect-modal').modal('hide')
}

// Show connect modal
$(document).ready(function () {
  $('#connect-modal').modal()
  if (autologin)
    setTimeout(() => {
      $('#connect-form button').click()
    }, 300);
})

// Populate form
var connectFormInputs = document.querySelectorAll('#connect-form input');
for (const ipt of connectFormInputs) {
  if (ipt.id === 'useHTTPS')
    if (defaultConnection.useHTTPS)
      ipt.checked = true
  ipt.setAttribute('value', defaultConnection[ipt.id])
}

$('#connect-form').submit(function (evt) {
  evt.preventDefault();
  var values = $(this).serializeArray();
  var useHTTPS = $("input[type='checkbox']#useHTTPS").prop('checked');
  let connectionOpts = {
    useHTTPS: useHTTPS
  }
  for (const val of values) {
    connectionOpts[val.name] = val.value
  }
  tryConnect(connectionOpts)
})

$('form#queryForm').submit(function (evt) {
  evt.preventDefault()
  var query = $('form input#query').val()
  executeQuery(query)
})

function tryConnect(connectionOpts) {
  const connector = new omnisci.MapdCon()
  connector
    .protocol(connectionOpts.protocol)
    .host(connectionOpts.hostname)
    .port(connectionOpts.port)
    .dbName(connectionOpts.database)
    .user(connectionOpts.username)
    .password(connectionOpts.password)
    .connectAsync()
    .then((res) => {
      window.connection = res
      hideConnectModal()
      populateQuery(sample_query)
      populateTables()
    })
    .catch(err => alert(err.error_msg))
}

function executeQuery(query) {
  connection.queryDF(query, { debug_info: true }, null, (debug_info) => {
    console.log(debug_info)
    $('pre#debug-info').append('\n')
    $('pre#debug-info').append(query + '\n')
    for (const [key, value] of Object.entries(debug_info)) {
      $('pre#debug-info').append('  ' + key + ": " + value + "\n")
    }
  }).then((results) => {
    console.log(results)
    populateResultsTable(results)
  })
}

function populateQuery(query_str) {
  $('form input#query').val(query_str)
}

function queryFromTableName(table_name) {
  let query = "SELECT * FROM " + table_name
  populateQuery(query)
  executeQuery(query)
}

function showTableDetails(evt) {
  let table_name = $(evt.currentTarget).text()
  $('#table-info-modal h5').text(table_name + " column details")
  console.log(table_name)
  Promise.all([
    connection.getFieldsAsync(table_name),
  ])
    .then(values => {
      let colList = $('#table-info-modal #col-list tbody')
      colList.empty()
      console.log(values)
      for (const col of values[0].columns) {
        let colEl = $("<tr></tr>")
        colEl.append("<td>" + col.name + "</td>")
        colEl.append("<td>" + col.type + "</td>")
        colList.append(colEl)
      }
      $('#table-info-modal').modal('show')
    })
}

function populateTables() {
  Promise.all([
    connection.getTablesAsync(),
  ]).then(values => {
    let tableContainer = $('ul#tables')
    tableContainer.empty()
    let addRow = (table_name) => {
      let new_item = $("<li class='list-group-item list-group-item-action'></li>").text(table_name)
      new_item.click(showTableDetails.bind())
      tableContainer.append(new_item)
    }
    values[0].map(x => addRow(x.name))
  })
}

function addCell(tr, type, value) {
  var td = document.createElement(type)
  td.textContent = value;
  tr.appendChild(td);
}

function populateResultsTable(arrowTable) {
  var thead = $(".data-view thead")[0];
  var tbody = $(".data-view tbody")[0];

  while (thead.hasChildNodes()) {
    thead.removeChild(thead.lastChild);
  }

  while (tbody.hasChildNodes()) {
    tbody.removeChild(tbody.lastChild);
  }

  var header_row = document.createElement("tr");
  for (let field of arrowTable.schema.fields) {
    addCell(header_row, "th", `${field}`);
  }

  thead.appendChild(header_row);

  for (let row of arrowTable) {
    var tr = document.createElement("tr");
    for (let cell of row) {
      let val = 'null';
      if (cell.length > 1)
        val = cell[1]
      addCell(tr, "td", val);
    }
    tbody.appendChild(tr);
  }
}