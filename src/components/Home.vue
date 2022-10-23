<template>
  <v-container>

    <v-card flat>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <div class="title">Does your xDrip+ (or similar) app work on your phone with specific versions and settings?</div>
          <div class="headline mt-2"><router-link to="auth" style="text-decoration:none; color:#FF5252"><v-icon large color="red accent-2">mdi-login</v-icon> SIGN IN</router-link><br> 
          <v-icon large color="red accent-2">mdi-hand-heart</v-icon> SHARE<br>
          <v-icon large color="red accent-2">mdi-handshake</v-icon> HELP EACH OTHER</div>
        </v-col>
      </v-row>
    </v-card>

    
    <v-row dense align="end" style="height: 50px;" class="mt-3 mb-1" v-if="signed_in">
      <v-col cols="6" md="2">
        <v-btn color="red darken-3" dark block id="btn-add_row" @click="addEmptyRowToDB(); if(!allow_edit) { allow_edit= true; showOrHideDeleteColumn()}" height="47px"><v-icon left>mdi-playlist-plus</v-icon> Add Row</v-btn>
      </v-col> 
      
      <v-col cols="6" md="2" id="switch-editing">
        <v-card flat color="red darken-3">
        <v-row align="end" justify="center">
        
        <v-switch height="0" color="white" dark v-model="allow_edit" label="TOGGLE EDITING" style="transform: scale(0.875);" class="font-weight-bold" @click.capture="showOrHideDeleteColumn()"></v-switch>
        
        </v-row>
        </v-card>
      </v-col>
    </v-row>
    

    <v-row dense>
      <v-col cols="12">
        <div id="xdrip-table"></div>
      </v-col>
    </v-row>


    
  </v-container>
</template>

<script>
export default {
  name: 'Home',


  mounted() {
    const Tabulator = require('tabulator-tables');
    require("firebase/firestore");

    var vm = this;
    var db = this.$firebase.firestore();

    //get data from database for every user
    db.collection('table_entries').get()
    .then(function(querySnapshot){
      //console.log("INIT TABLE FROM DB");
      var rows = [];
      querySnapshot.forEach(function(doc) {
        var row = doc.data();
        row.id = doc.id;
        rows.push(row)
      })

      vm.table.updateOrAddData(rows)
      vm.table.setSort("created", "desc")
    })
    .catch(function(error){
      console.log("ERROR IN INIT TABLE FROM DB", error);
    });


  //table functions

  //delete icon html
  var tableDeleteIconFormatter = function(cell, formatterParams, onRendered){ // eslint-disable-line no-unused-vars
      if(tableCellIsOwnedByUser(cell)) {
        //if(vm.allow_edit)
          return "<i class='material-icons delete-button'>delete</i>";
        //else
          //return "<i class='material-icons' style='color: #EBEBE4'>delete</i>"
          //return "<i class='mdi mdi-delete-off'></i>"
      }
      else
        return "";
  };

  var tableDeleteIconClicked = function(e, cell){ // eslint-disable-line no-unused-vars  
    if(e.target.className.includes("delete-button")) {
      var rowid = cell.getRow().getIndex();
      
      db.collection("table_entries").doc(rowid).delete().then(function() {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      });
        
    }
  };

  var tableSetEditable = cell => { // function pointer because of this context
    //forbid if editing is disabled 
    if(!this.allow_edit)
      return false;

    //allow only if cell is owned by user
    return tableCellIsOwnedByUser(cell);
  }

  var tableCellIsOwnedByUser = cell => {
    var author_uid = cell.getRow().getData().author_uid;
    var user_uid = this.getOwnUserID();

    if (author_uid === user_uid) {
      return true;
    } 

    return false;
  }

  var tableCellEditingStartedByUser = cell => { // eslint-disable-line no-unused-vars
    //console.log("CELL EDITING STARTED")
    vm.userIsEditingTable = true;
  }

  var tableCellEditingCancelledByUser = cell => {
    //console.log("CELL EDITING CANCELLED")
    vm.userIsEditingTable = false;
    writeCellToDB(cell);
  }

  var tableCellEditingFinishedByUser = cell => {
    //console.log("CELL EDITING FINISHED")
    vm.userIsEditingTable = false;
    writeCellToDB(cell)
  }

  //helper 
  function writeCellToDB(cell) {
    var rowid = cell.getRow().getIndex();
    var row = JSON.parse(JSON.stringify(cell.getRow().getData())); //copy object
    delete row.id;

    // Add a new document in collection
    db.collection("table_entries").doc(rowid).set(row)
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }

  var tableTimestampToDateFormatter = cell => {
    var d = new Date(cell.getValue());
    return ('0' + d.getHours()).slice(-2) + ':' + 
      ('0'+d.getMinutes()).slice(-2) +' '+
      ('0' + d.getDate()).slice(-2)+'.'+
      ('0' + (d.getMonth()+1)).slice(-2)+'.'+
      d.getFullYear();
  }

// textArea with fixed height and a scrollbar -> scrollbar not visible on phones :/
//   var customTextareaFormatter = function(cell, formatterParams, onRendered){ // eslint-disable-line no-unused-vars
//     var el = cell.getElement();
//     el.style.whiteSpace = "pre-wrap";
//     el.style.overflow = "auto";
//     el.style.maxHeight = "50px";
//     return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
// };

  //Define Table Columns
  {
    let t;
    var tableColumns = [ 
      { 
        formatter: tableDeleteIconFormatter, visible: true, width:20, align:"center", 
        headerSort:false, cellClick:tableDeleteIconClicked, editor: false, editable: () => false 
      },
      {
        title:"App", field:"app_name", align:"center", width: 53, headerVertical:true, editable: tableSetEditable, 
        editor: true, tooltip: ( t ="Name of the app that you want to share information about"), headerTooltip: t
      },
      {
        title:"Data Source", field:"data_source", align:"center", formatter: "textarea", width: 100, headerVertical:true, editable: tableSetEditable, 
        editor: true, tooltip: ( t ="The source of your blood glucose measurements"), headerTooltip: t
      },
      {
        title:"Phone Brand", field:"phone_brand", width: 100, headerVertical:true, editable: tableSetEditable, editor: true
      },
      {
        title:"Phone Model", field:"phone_model", width: 100 ,headerVertical:true, editable: tableSetEditable, editor: true
      },
      {
        title:"Android Version", field:"android_version", align:"center", width:50, headerVertical:true, editable: tableSetEditable, 
        editor: true, tooltip: ( t ="Version of your Android operating system"), headerTooltip: t
      },
      {
        title:"Security Patch", field:"android_security_patch", align:"center", width:70, headerVertical:true, editable: tableSetEditable, 
        editor: true, tooltip: ( t ="Security patch version of Android; typically found somewhere in the settings next to the Android Version"), headerTooltip: t
      },
      {
        title:"App Version", field:"app_version", align:"center", headerVertical:true, width: 150, editable: tableSetEditable, 
        editor: true, tooltip: ( t ="Version of the app mentioned in the first column"), headerTooltip: t
      },
      {
        title:"Author", field:"author_name", align:"left", width: 100, headerVertical:true, editable: tableSetEditable, editor: true
      },
      {
        title:"Does it work?", field:"stars", formatter:"star", formatterParams:{stars:5}, headerVertical:true, width: 80, 
        editable: tableSetEditable, editor: true, tooltip: ( t ="Rate the overall operating state"), headerTooltip: t
      },
      {
        title:"Notes", field:"notes", align:"left", width: 400, formatter: "textarea", headerSort:false, headerVertical:true, editable: tableSetEditable, 
        editor: "textarea", tooltip: ( t ="Any special settings / notes?"), headerTooltip: t
      },
      {
        title:"Created", formatter: tableTimestampToDateFormatter, field:"created", align:"left", width: 100, 
        headerVertical:true, editable: () => false, editor: false, sorter:'number'
      },
    ];
  }

  //create Tabulator on DOM element 
  vm.table = new Tabulator("#xdrip-table", {   // eslint-disable-line no-unused-vars
    height:"500", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    layout:"fitDataFill",
    data: vm.tabledata,
    cellEditing: tableCellEditingStartedByUser,
    cellEditCancelled: tableCellEditingCancelledByUser,
    //reactiveData: true, this is needed if data array is manipulated directly; we manipulate the data only through helper functions like table.updateData()
    cellEdited: tableCellEditingFinishedByUser,
    initialSort:[{column:"created", dir:"desc"}],
    addRowPos: "true",
    resizableColumns: vm.$vuetify.breakpoint.mdAndUp ? true : false, //allow resizing on big screens only
    columns: tableColumns,
  });

  vm.$firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      //console.log("AUTHENTICATED");
      vm.signed_in = true;

      //vm.allow_edit = true;
      vm.showOrHideDeleteColumn();

      //listen to changes in database for own user only
      db.collection('table_entries').where('author_uid', '==', vm.getOwnUserID())
      .onSnapshot(function(querySnapshot){
        //console.log("UPDATE TABLE FROM DB FOR OWN USER ONLY");

        // do not change table when user is actively editing -> would cause an unselect of current cell
        if(vm.userIsEditingTable)
          return;

        //get all row ids in table from user
        var rowIDSInTable = [];
        vm.table.getRows().forEach(row => {
          if(row.getData().author_uid === vm.getOwnUserID())
            rowIDSInTable.push(row.getIndex())
        });

        //console.log("A rows from user", rowIDSInTable)

        var rowIDSInQuery = []
        querySnapshot.forEach(doc => {
          rowIDSInQuery.push(doc.id)
        });

        //console.log("B rows from query", rowIDSInQuery)

        var updateIDs = rowIDSInTable.filter(id => rowIDSInQuery.includes(id));
        //console.log("A intersect B", updateIDs);

        var deleteIDs = rowIDSInTable.filter(id => !rowIDSInQuery.includes(id));
        //console.log("A without B", deleteIDs);

        var addIDs = rowIDSInQuery.filter(id => !rowIDSInTable.includes(id));
        //console.log("B without A", addIDs);


        //console.log("delete ids", deleteIDs)
        //delete from table
        deleteIDs.forEach(rowid =>{
          vm.table.deleteRow(rowid)
        });

        //console.log("update ids", updateIDs)
        //extract rows from query by id
        var updateRows = [];
        var addRows = [];
        querySnapshot.forEach(doc => {
          if(updateIDs.includes(doc.id)) {
            var row = doc.data()
            row.id = doc.id
            updateRows.push(row)
          }
          else if(addIDs.includes(doc.id)) {
            row = doc.data()
            row.id = doc.id
            addRows.push(row)
          }
        });

        //console.log("update rows", updateRows)

        //update table
        vm.table.updateData(updateRows);

        //add data
        vm.table.addData(addRows)
      });

    } else {
      //console.log("SIGNED OUT");

      // No user is signed in.
      vm.signed_in = false; 
      vm.showOrHideDeleteColumn();
    }
  });

  },

  methods: {
    showOrHideDeleteColumn() {
      var vm = this;
      var cols = vm.table.getColumns();
      cols.forEach(function(col) {
        if(!col.getField()) { //hack here to identify column table by checking that the field prop is null
          if(vm.allow_edit && vm.signed_in) {
            col.show();
          } else {
            col.hide();
          }
        }
      });
    },
    addEmptyRowToDB() {
      var row = this.createEmptyRowData();
      row.author_uid = this.getOwnUserID();
      row.author_name = this.getOwnUserName();
      row.created = Date.now();

      var db = this.$firebase.firestore();

      // Add a new document with a generated id.
      db.collection("table_entries").add(row)
      .then(function(docRef) { // eslint-disable-line no-unused-vars
          //console.log("Document written to DB with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    },
    createEmptyRowData() {
      return {
        android_security_patch: "",
        android_version: "",
        app_name: "",
        app_version: "",
        author_name: "",
        author_uid: "",
        data_source: "",
        notes: "",
        phone_brand: "",
        phone_model: "",
        stars: 0,
        created: ""
      }
    },
    getOwnUserID() {
      var user = this.$firebase.auth().currentUser;
      if(user)
        return user.uid;
      else
        return null;
    },
    getOwnUserName() {
      var user = this.$firebase.auth().currentUser;
      if(user)
        return user.displayName;
      else
        return null;
    },

  },

  data: function() {
    return {
      tabledata: [],
      table: {},
      allow_edit: false,
      signed_in: false,
      userIsEditingTable: false
    }
  },
};
</script>

<style scoped>
  @import "./../../node_modules/tabulator-tables/dist/css/tabulator.css";
  @import "https://fonts.googleapis.com/icon?family=Material+Icons";
</style>