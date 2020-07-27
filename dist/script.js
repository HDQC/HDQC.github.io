// [TABLE INITIALIZATION AND TABLE SETTINGS]
var defaultData = []; // Default data array for stats 
var table = $('#combinations').DataTable( { // Create a table
    // DataTables settings
  	ajax: {
    	url: 'https://raw.githubusercontent.com/PXc8SVej/Submersible-Parts-Calculator/master/data5.json', // All combinations data in JSON file
   		dataSrc: 'Data'  // JSON Data name
 	},
  	columns: [ // Import data per column
     	{ "data": "id" },
     	{ "data": "hull" },
     	{ "data": "stern" },
     	{ "data": "bow" },
     	{ "data": "bridge" },
     	{ "data": "cost" },
     	{ "data": "surv" },
     	{ "data": "retr" },
     	{ "data": "speed" },
     	{ "data": "range" },
     	{ "data": "favor" },
     	{ "data": "rank" },
        { "data": "time" },
        { "data": "mod" },        
  	],
    language: { //Change 'record(s)' to 'combination(s)'
    	"info": "Showing <strong>_TOTAL_</strong> combinations",
    	"infoEmpty": "Showing <strong>0</strong> combinations",
    	"infoFiltered": "", // Hide filtered combinations info
    	"lengthMenu": "Show <strong>_MENU_</strong> combinations",
        "zeroRecords": "No matching combinations found",
        select: {
            rows: {
                _: "You have selected %d combinations",
                0: "",
                1: "Only 1 combination selected"
            }
        }
    },
    select: {
        style: 'multiple' // Single and multi select (if ctrl or shift are holded)
    },
    dom: 'it', // Hide default search bar
    deferRender:    true,
    scrollY:        490,
    scrollX:        true,
    scrollCollapse: true,
    scroller:       true,
    columnDefs: [ {
        "orderData": 8,    
        "targets": 12
    }],
    initComplete: function(settings, json) { // When the table is loaded
        table.rows().every(function (rowIdx, tableLoop, rowLoop) { // each row
            defaultData[rowIdx] = []; // create array in array (lazy initialization)
            defaultData[rowIdx][0] = this.data().surv; // add default surv value to array
            defaultData[rowIdx][1] = this.data().retr; // add default retr value to array
            defaultData[rowIdx][2] = this.data().speed; // add default speed value to array
            defaultData[rowIdx][3] = this.data().range; // add default range value to array
            defaultData[rowIdx][4] = this.data().favor; // add default favor value to array
            defaultData[rowIdx][5] = this.data().rank; // add default rank value to array
        })
    }
});

// [CHECKBOXES CONTROL PANEL]
// partFilter function logic:
// 1. Check checkbox
//      1.1. If true, check how many types in the search query
//          1.1.1. If > 0, check the type position in the search query (first or not)
//              1.1.1.1. If it is the first, remove  "type + '|'" from the search query
//              1.1.1.2. If it is not the first , remove "'|' + type" from the search query
//          1.1.2. If = 0 and if the first class = the selected class or if the first class is empty, change the search query to ""
//      1.2. If false, check how many types in the search query
//          1.2.1. If > 0, add "'|' + type"
//          1.2.2. If = 0, add "type"

// '^(?:(?!TYPE).)*$\r?\n?' - the default query (TYPE is ... a part type (S, U etc.)). Add '|' if there are multiple types (Example: '^(?:(?!S|U|C+).)*$\r?\n?')
// There is a lot of pain with '|' in the search query. That's why there are so many 'if' statements here

var search = '^(?:(?!).)*$\r?\n?', // The default search query | Hide everything
    sHull = search,
    sStern = search,
    sBow = search,
    sBridge = search,
    sParts = ['', sHull, sStern, sBow, sBridge]; // '' because we start from 1st column (Hull) (sParts[1])

function partFilter(part, cb, typeAbb) { // part - a column (1 - Hull), cb - a pressed checkbox, typeAbb - a type abbreviation (S, U etc.)
    if (sParts[part] == '') { // if the query search is '', we can't continue
        sParts[part] = search; // that's why we do this
    };
        
    query = sParts[part].slice(7, sParts[part].length - 9).split(' '); // The types amount in the search query

    if (cb.checked) { // 1. | 1.1.
        if (query.length > 2) { // 1.1.1.
            if (query[0] == typeAbb.replace(' ','')) { // 1.1.1.1.
                sParts[part] = sParts[part].replace(typeAbb + '|', ''); // Remove 'type + |'
            } else { // 1.1.1.2.
                sParts[part] = sParts[part].replace('|' + typeAbb, ''); // Remove '| + type'
            }
        } else if (query[0] == typeAbb.replace(' ','') || query[0] == '') { // 1.1.2.         
            sParts[part] = ''; // Show all column (Hull, Stern etc.) info, because if we won't change it, the default search query will hide everything
        }
    } else { // 1.2.
        if (query.length > 1) { // 1.2.1.
            sParts[part] = [sParts[part].slice(0, -9), '|' + typeAbb, sParts[part].slice(-9)].join(''); // Add '| + type', but after the first type      
        } else { // 1.2.2.
            sParts[part] = [sParts[part].slice(0, 7), typeAbb, sParts[part].slice(7)].join(''); // Add 'type' as the first type
        };
    };
    query = sParts[part].slice(7, sParts[part].length - 9).split(' '); // The types amount in the search query

    table.columns(part).search(sParts[part], true, false).draw(); // Redraw our table with the new search query by a column
    setChecker($(cb).parent().parent().parent().children().last().children().children().attr('id'), // checkbox > div > td > tr > last td > div > checkbox > get ID of setSwitcher
               $(cb).attr('class').split(' ').pop()); // the last checkbox class
};

// This function checks only those part checkboxes, which were unchecked and unchecks every part checkboxes, if the set seckbox was unchecked
function setSwitcher(cb) { // cb - the set checkbox
    if (cb.checked) {
        for (var i = 1; i < 5; i++) { // 1 - 4: Hull(1), Stern(2) etc.
            var part = $(cb).parent().parent().parent().children().eq(i).children().children(); // The checkbox of every part
            if (part.is(':checked') == false) { // Prevents excess checks for better performance
                part.prop('checked', true).change(); // Check only that checkbox which was unchecked
            }
        }
    } else {
        var type = $(cb).parent().parent().parent().children().eq(1).children().children().attr('class').split(' ').pop(); // Find a type of the unchecked set checkbox
        $('.' + type).prop('checked', false).change(); // Uncheck an every part of the unchecked set checkbox
    }
};

// This function unchecks the set checkbox if any part of the set checkbox was unchecked, and checks the set checkbox if all part checkboxes were checked
function setChecker(setSwitcherID, type) { // setSwitchedID - the set checkbox id
    var typeParts = $('.' + type), // All set parts
        sets = [], // All sets IDs
        fourVers = 0, // How many checkboxes 4.x version are checked
        fiveVers = 0, // How many checkboxes 5.x version are checked
        bothVers = 0; // If both 4.x and 5.x version checkboxes are checked

    $('.set').each(function () { // Get all sets IDs
        sets.push(this.id); // and push them to an array
    });

    if ( typeParts.length === typeParts.filter(':checked').length ) { // If all set parts are checked
        $('#' + setSwitcherID).prop('checked', true); // check the set checkbox

        for (var i = 0; i < 10; i++) { // The options (4.x, 5.x, All) checker
            if ($('#' + sets[i]).prop('checked') == true && i < 5) { // The 4.x option checkbox checker
                fourVers++; // Some set checkbox of 4.x is checked
                if (fourVers == 5) { // If all sets checkboxes of 4.x are checked
                    $('#customCheck51').prop('checked', true); // check the 4.x option checkbox
                    bothVers++; // all 4.x sets are checked
                }
            };

            if ($('#' + sets[i]).prop('checked') == true && i < 10 && i > 4) { // The 5.x option checkbox checker
                fiveVers++; // Some set checkbox of 5.x is checked
                if (fiveVers == 5) { // If all sets checkboxes of 5.x are checked
                    $('#customCheck52').prop('checked', true); // check the 5.x option checkbox
                    bothVers++; // all 5.x sets are checked  
                }
            };

            if (bothVers == 2) { // If all sets checkboxes of both 4.x and 5.x are checked
                $('#customCheck53').prop('checked', true); // check the All option checkbox 
            };
        };
    } else {
        $('#' + setSwitcherID).prop('checked', false); // uncheck the set checkbox
        $('#customCheck53').prop('checked', false); // uncheck the All option checkbox

        if (setSwitcherID == sets[0] || setSwitcherID == sets[1] || setSwitcherID == sets[2] || setSwitcherID == sets[3] || setSwitcherID == sets[4]) { // without the 'for' loop for best performance
            $('#customCheck51').prop('checked', false); // uncheck the 4.x option checkbox              
        } else {
            $('#customCheck52').prop('checked', false); // uncheck the 5.x option checkbox               
        };
    };
};

// The option checkboxes function (4.x, 5.x, All)
// Works almost like partFilter(), but doesn't call function each time for every part - only one per column for best performance
// That's why this function is huge
// I'm really proud of this monster :3 because it solves a lot of lags\freezes
function setsSwitcher(cb) {
    for (var i = 0; i < sParts.length; i++) { // every part (Hull, Stern etc.)
        if (sParts[i] == '') { // if the query search is '', we can't continue
            sParts[i] = search; // that's why we do this
        }
    };
    //[CHECKBOXES CHECKER (WITHOUT ANY FUNCTON CALL) SECTION]
    for (var i = 0; i < 10; i++) { // Check\uncheck all set and part checkboxes if
        // checked
        if (cb.checked && cb.id == 'customCheck51' && i < 5) { // the 4.x option checkbox
            $('.part-4-version').prop('checked', true); // check all 4.x sets and part checkboxes
        } else if (cb.checked && cb.id == 'customCheck52' && i < 10 && i > 4) { // the 5.x option checkbox
            $('.part-5-version').prop('checked', true); // check all 5.x sets and part checkboxes
        } else if (cb.checked && cb.id == 'customCheck53') { // the All option checkbox
            $('.part-4-version').prop('checked', true); // check 4.x set and part checkboxes
            $('.part-5-version').prop('checked', true); // check 5.x set and part checkboxes
        };

        // unchecked
        if (cb.checked == false && cb.id == 'customCheck51' && i < 5) { // the 4.x option checkbox
            $('.part-4-version').prop('checked', false); // uncheck all 4.x set and part checkboxes
            $('#customCheck53').prop('checked', false); // uncheck the All option checkbox
        } else if (cb.checked == false && cb.id == 'customCheck52' && i < 10 && i > 4) { // the 5.x option checkbox
            $('.part-5-version').prop('checked', false); // uncheck all 5.x set and part checkboxes
            $('#customCheck53').prop('checked', false); // uncheck the All option checkbox
        } else if (cb.checked == false && cb.id == 'customCheck53') { // the All option checkbox
            $('.part-4-version').prop('checked', false); // uncheck 4.x set and part checkboxes
            $('.part-5-version').prop('checked', false); // uncheck 5.x set and part checkboxes
        };
    };

    if ($('#customCheck51').prop('checked') && $('#customCheck52').prop('checked')) { // if both 4.x and 5.x options are checked
        $('#customCheck53').prop('checked', true); // check the All option checkbox
    };

    if ($('#customCheck51').prop('checked') == false && $('#customCheck52').prop('checked') == false) { // if both 4.x and 5.x options are unchecked
        $('#customCheck53').prop('checked', false); // uncheck the All option checkbox
    };

    //[CHECKBOXES FUNCTION CALL SECTION]
    var types = ['S ', 'U ', 'W ', 'C ', 'Y ', 'S\\+ ', 'U\\+ ', 'W\\+ ', 'C\\+ ', 'Y\\+ '], // All type abbreviations
        hullQuery = sParts[1].slice(7, -9).split('|'), // get an array of types from the current hull column search query
        sternQuery = sParts[2].slice(7, -9).split('|'), // get an array of types from the current stern column search query
        bowQuery = sParts[3].slice(7, -9).split('|'), // get an array of types from the current bow column search query
        bridgeQuery = sParts[4].slice(7, -9).split('|'), // get an array of types from the current bridge column search query
        parts = ['', hullQuery, sternQuery, bowQuery, bridgeQuery]; // an array of all types of all column queries

    if (cb.checked != true) { // if the selected checkbox is unchecked
        for (var a = 1; a < parts.length; a++) { // Each part (Hull, Stern etc.)
            if (parts[a][0] != '') { // Checks if the selected part is not empty and contains at least 1 type
                for (var i = 0; i < types.length; i++) { // Each possible type
                    if (parts[a].includes(types[i]) != true) { // Compares types of the selected part with all possible types to prevent repeats
                        if (cb.id == 'customCheck51' && i < 5) { // if checked the 4.x option checkbox
                            sParts[a] = [sParts[a].slice(0, -9), '|' + types[i], sParts[a].slice(-9)].join(''); // add the 4.x missing types to the selected part column query
                        } else if (cb.id == 'customCheck52' && i < 10 && i > 4) { // if checked the 5.x option checkbox
                            sParts[a] = [sParts[a].slice(0, -9), '|' + types[i], sParts[a].slice(-9)].join(''); // add the 5.x missing types to the selected part column query
                        } else if (cb.id == 'customCheck53') { // if checked the All option checkbox
                            sParts[a] = [sParts[a].slice(0, -9), '|' + types[i], sParts[a].slice(-9)].join(''); // add both 4.x and 5.x all missing types to the selected part column query                            
                        }
                    }
                }
            } else { // The selected part is empty
                if (cb.id == 'customCheck51') { // If checked the 4.x option checkbox
                    sParts[a] = [sParts[a].slice(0, 7), 'S |U |W |C |Y ', sParts[a].slice(7)].join(''); // Add all 4.x types to the selected part column query
                } else if (cb.id == 'customCheck52') { // If checked the 5.x option checkbox
                    sParts[a] = [sParts[a].slice(0, 7), 'S\\+ |U\\+ |W\\+ |C\\+ |Y\\+ ', sParts[a].slice(7)].join(''); // Add all 5.x types to the selected part column query
                } else if (cb.id == 'customCheck53') { // If checked the All option checkbox
                    sParts[a] = [sParts[a].slice(0, 7), 'S |U |W |C |Y |S\\+ |U\\+ |W\\+ |C\\+ |Y\\+ ', sParts[a].slice(7)].join(''); // Add both 4.x and 5.x all types to the selected part column query                            
                }
            }

            table.columns(a).search(sParts[a], true, false).draw(); // Redraw our table with the new query for the selected part
        }
    } else {
        for (var a = 1; a < parts.length; a++) { // Each part (Hull, Stern etc.)
            if (cb.id == 'customCheck53' || parts[a][0] == '') { // if checked the All option checkbox or there are no types in the selected part
                sParts[a] = ''; // Show everything
            } else { // if there is 1 or more types in the selected part and was checked the 4.x option checkbox or the 5.x option checkbox
                for (var b = 0; b < parts[a].length; b++) { // check every type in the selected part with all possible types
                    for (var i = 0; i < types.length; i++) { // every possible type
                        if (parts[a].length == 1) { // 1. If there is only 1 type in the selected part
                            if (cb.id == 'customCheck51' && parts[a][0] == types[i] && i < 5) { // 1.1. If the 4.x option checkbox is selected and this only type is from 4.x
                                sParts[a] = ''; // 1.1.1. The selected part query is empty now
                                i = types.length; // Stops the check
                            };

                            if (cb.id == 'customCheck52' && parts[a][0] == types[i] && i < 10 && i > 4) { // 1.2. If the 5.x option checkbox is selected and this only type is from 5.x
                                sParts[a] = ''; // 1.2.1. The selected part query is empty now
                                i = types.length; // Stops the check
                            };
                        } else { // 2. If there are 2 or more types in the selected part
                            if (cb.id == 'customCheck51' && parts[a].includes(types[i]) && i < 5) { // 2.1. If the 4.x option checkbox is selected and the 4.x selected type contains in the selected part
                                if (parts[a][0] == types[i]) { // 2.1.1. If the selected type is first and equals the checked type
                                    sParts[a] = sParts[a].replace(types[i] + '|', ''); // 2.1.1.1. Remove the type + | from the selected part query
                                    parts[a].splice(parts[a].indexOf(types[i]), 1); // Remove the removed type from an array of types
                                } else { // 2.1.2. If the selected type is not first
                                    sParts[a] = sParts[a].replace('|' + types[i], ''); // 2.1.2.1. Remove the | + type from the selected part query
                                    parts[a].splice(parts[a].indexOf(types[i]), 1); // Remove the removed type from an array of types
                                };
                            }

                            if (cb.id == 'customCheck52' && parts[a].includes(types[i]) && i < 10 && i > 4) { // 2.2. If the 5.x option checkbox is selected and the 5.x selected type contains in the selected part
                                if (parts[a][0] == types[i]) { // 2.2.1. If the selected type is first and equals the checked type
                                    sParts[a] = sParts[a].replace(types[i] + '|', ''); // 2.2.1.1. Remove the type + | from the selected part query
                                    parts[a].splice(parts[a].indexOf(types[i]), 1); // Remove the removed type from an array of types
                                } else { // 2.2.2. If the selected type is not first
                                    sParts[a] = sParts[a].replace('|' + types[i], ''); // 2.2.2.1. Remove the | + type from the selected part query
                                    parts[a].splice(parts[a].indexOf(types[i]), 1); // Remove the removed type from an array of types                           
                                };
                            }
                        }
                    }
                }
            }

            table.columns(a).search(sParts[a], true, false).draw(); // Redraw our table with the new query for the selected part
        }
    };
};

// [IE FIX]
// This function was created because IE browsers cache checkboxes statements after the page refreshing
// So it fixes the problem above
$(function(){ // when page loads
    $('#checkboxes-table input:checkbox').prop('checked', true); // check (without functions calling) every checkbox in the checkboxes control panel
});

// [SLIDERS CONTROL PANEL]
$(".slider").slider({}); // Sliders initialization

function setFieldsVal(slider) { // Set slider text fields values to slider values
    minId = $(slider).parent().parent().children().eq(2).children().attr('id'); // Get the min text field ID
    maxId = $(slider).parent().parent().children().eq(3).children().attr('id'); // Get the max text field ID
    exactId = $(slider).parent().parent().children().eq(4).children().attr('id'); // Get the precisely text field ID

    values = slider.value.split(','); // move min and max slider values to an array
    sliderMinVal = parseInt(values[0]); // Get the min slider value
    sliderMaxVal = parseInt(values[1]); // Get the max slider value

    $("#" + minId).val(sliderMinVal); // The cost min text field value = the cost min slider value
    $("#" + maxId).val(sliderMaxVal); // The cost max text field value = the cost max slider value
    $("#" + exactId).val(''); // The cost precisely value text field is empty

    if (sliderMinVal == sliderMaxVal) { // If max and min values are equal
        $("#" + exactId).val(sliderMinVal); // The cost precisely value = the cost min slider value
    };
};

function setSliderMinVal(minField) { // Set the slider min value to the min text field value
    sliderId = $(minField).parent().parent().children().eq(1).children().eq(1).attr('id'); // Get the slider id
    maxId = $(minField).parent().parent().children().eq(3).children().attr('id'); // Get the max text field ID
    exactId = $(minField).parent().parent().children().eq(4).children().attr('id'); // Get the precisely text field ID
    minId = $(minField).attr('id'); // Get the min text field ID
    maxSlider = $('#' + sliderId).data('sliderMax'); // Get the slider max value
    minSlider = $('#' + sliderId).data('sliderMin'); // Get the slider min value

    column = $(minField).parent().parent().index() + 5; // Get the column number

    if ($('#' + minId).val() > maxSlider) { // If the min text field value > the slider max value
        $('#' + minId).val(maxSlider); // The min text field value = the max slider value
    };

    if ($('#' + minId).val() < minSlider) { // If the min text field value < the slider min value
        $('#' + minId).val(minSlider); // The min text field value = the min slider value
    };

    min = parseInt($("#" + minId).val()); // Find the cost min text field value and transform it to an integer
    max = $('#' + sliderId).data('slider').getValue()[1]; // Find the cost max slider value

    if ($('#' + minId).val() > max) { // If the min text field value > the max text field value
        max = min; // The max text field value = the min text field value
        $('#' + maxId).val(max); // The max text field = the max text field value
    };

    $('#' + sliderId).slider('setValue', [min, max]); // Set new value for the cost slider

    if (min == max) { // If max and min values are equal
        $("#" + exactId).val(min); // The cost precisely value = the cost min slider value
    } else {
        $("#" + exactId).val(''); // The cost precisely value is empty        
    };

    statsFilter(column); // redraw our table with new stats
};

function setSliderMaxVal(maxField) { // Set the slider max value to the max text field value
    sliderId = $(maxField).parent().parent().children().eq(1).children().eq(1).attr('id'); // Get the slider id
    exactId = $(maxField).parent().parent().children().eq(4).children().attr('id'); // Get the precisely text field ID
    minId = $(maxField).parent().parent().children().eq(2).children().attr('id'); // Get the min text field ID
    maxId = $(maxField).attr('id'); // Get the min text field ID
    maxSlider = $('#' + sliderId).data('sliderMax'); // Get the slider max value
    minSlider = $('#' + sliderId).data('sliderMin'); // Get the slider min value

    column = $(maxField).parent().parent().index() + 5; // Get the column number

    if ($('#' + maxId).val() > maxSlider) { // If the max text field value > the slider max value
        $('#' + maxId).val(maxSlider); // The max text field value = the max slider value
    };

    if ($('#' + maxId).val() < minSlider) { // If the max text field value < the slider min value
        $('#' + maxId).val(minSlider); // The max text field value = the min slider value
    };

    min = $('#' + sliderId).data('slider').getValue()[0]; // Find the cost min slider value
    max = parseInt($("#" + maxId).val()); // Find the cost min text field value and transform it to an integer

    if ($('#' + maxId).val() < min) { // If the max text field value < the min text field value
        min = max; // The min text field value = the max text field value
        $('#' + minId).val(min); // The min text field = the min text field value
    };

    $('#' + sliderId).slider('setValue', [min, max]); // Set new value for the cost slider    

    if (min == max) { // If max and min values are equal
        $("#" + exactId).val(max); // The cost precisely value = the cost max slider value
    } else {
        $("#" + exactId).val(''); // The cost precisely value is empty   
    };

    statsFilter(column); // redraw our table with new stats
};

function setSliderExactVal(exactField) { // Set slider values and slider text fields values to the precisely text field value
    exactId = $(exactField).attr('id'); // Get precisely text field ID
    sliderId = $(exactField).parent().parent().children().eq(1).children().eq(1).attr('id'); // Get the slider id
    minId = $(exactField).parent().parent().children().eq(2).children().attr('id'); // Get the min text field ID
    maxId = $(exactField).parent().parent().children().eq(3).children().attr('id'); // Get the max text field ID
    maxSlider = $('#' + sliderId).data('sliderMax'); // Get the slider max value
    minSlider = $('#' + sliderId).data('sliderMin'); // Get the slider min value

    column = $(exactField).parent().parent().index() + 5; // Get the column number

    exact = parseInt($("#" + exactId).val()); // Get the precisely text field value

    if ($('#' + exactId).val() > maxSlider) { // If the precisely text field value > the slider max value
        $('#' + exactId).val(maxSlider); // The precisely text field value = the max slider value
        exact = maxSlider; // The precisely text field value = the max slider value
    };

    if ($('#' + exactId).val() < minSlider) { // If the precisely text field value < the slider min value
        $('#' + exactId).val(minSlider); // The precisely text field value = the min slider value
        exact = minSlider; // The precisely text field value = the min slider value
    };

    $('#' + sliderId).slider('setValue', [exact, exact]); // Set new value for the cost slider      
    $("#" + minId).val(exact); // Set the min text field value to the precisely text field value
    $("#" + maxId).val(exact); // Set the max text field value to the precisely text field value

    statsFilter(column); // redraw our table with new stats
};

function defaultBtn(btn) { // restore default values per slider
    exactId = $(btn).parent().parent().children().eq(4).children().attr('id'); // Get precisely text field ID
    sliderId = $(btn).parent().parent().children().eq(1).children().eq(1).attr('id'); // Get the slider id
    minId = $(btn).parent().parent().children().eq(2).children().attr('id'); // Get the min text field ID
    maxId = $(btn).parent().parent().children().eq(3).children().attr('id'); // Get the max text field ID
    minSlider = $('#' + sliderId).data('sliderMin'); // Get the slider min value
    max = $('#' + maxId).data("default"); // Get the max text field default value
    min = $('#' + minId).data("default"); // Get the min text field default value

    column = $(btn).parent().parent().index() + 5; // Get the column number

    $("#" + sliderId).slider('setValue', [minSlider, max]); // Set the slider values to default
    $('#' + minId).val(min); // Set the min text field value to default
    $('#' + maxId).val(max); // Set the max text field value to default
    $('#' + exactId).val(''); // Set the exact text field value to empty

    statsFilter(column); // redraw our table with new stats
};

function defaultAllBtn(btn) { // restore default values for each slider
    for (var i = 0; i < 7; i++) { // for each slider
        sliderId = $(btn).parent().parent().parent().parent().children().eq(1).children().eq(i).children().eq(1).children().eq(1).attr('id'); // Get the slider id   
        minId = $('#' + sliderId).parent().parent().children().eq(2).children().attr('id'); // Get the min text field ID
        maxId = $('#' + sliderId).parent().parent().children().eq(3).children().attr('id'); // Get the max text field ID
        exactId = $('#' + sliderId).parent().parent().children().eq(4).children().attr('id'); // Get precisely text field ID
        minSlider = $('#' + sliderId).data('sliderMin'); // Get the slider min value
        max = $('#' + maxId).data("default"); // Get the max text field default value
        min = $('#' + minId).data("default"); // Get the min text field default value

        if (parseInt($('#' + minId).val()) != min || parseInt($('#' + maxId).val()) != max) { // Excludes extra the redraw table function calls for best performance
            $("#" + sliderId).slider('setValue', [minSlider, max]); // Set the slider values to default
            $('#' + minId).val(min); // Set the min text field value to default
            $('#' + maxId).val(max); // Set the max text field value to default
            $('#' + exactId).val(''); // Set the exact text field value to empty

            statsFilter(i + 5); // redraw our table with new stats
        };

    };

    if (parseInt($('#bonusVal').val()) != 50) {
        defaultBonusBtn();        
    };
};

function statsFilter(column) { // Filter our table with new stats
    min = parseInt($('#sliders-table').children().eq(1).children().eq(column - 5).children().eq(2).children().val()); // Get the min text field value
    max = parseInt($('#sliders-table').children().eq(1).children().eq(column - 5).children().eq(3).children().val()); // Get the max text field value
    minId = $('#sliders-table').children().eq(1).children().eq(column - 5).children().eq(2).children().attr('id');
    maxId = $('#sliders-table').children().eq(1).children().eq(column - 5).children().eq(3).children().attr('id');

    if (min != $('#' + minId).data("default") || max != $('#' + maxId).data("default")) { // checks if min or max are different from default values. For best performance
        range = '^('; // The beginning of our regex

        for (var i = min; i <= max; i++) { // from min to max
            range += i + '|'; // add each number from min to max to our regex (I couldn't find better way)
        }

        range = range.slice(0, -1); // remove the last |
        range += ')$'; // the end of our regex

        table.columns(column).search(range, true, false).draw(); // redraw our table with new stats
    } else {
        table.columns(column).search('', true, false).draw(); // redraw our table with new stats        
    }
};

$('#cost').on('slideStop', function () { // when the cost slider is stopped
    statsFilter(5); // redraw our table with new stats
});

$('#surv').on('slideStop', function () { // when the surv slider is stopped
    statsFilter(6); // redraw our table with new stats
});

$('#retr').on('slideStop', function () { // when the retr slider is stopped
    statsFilter(7); // redraw our table with new stats
});

$('#speed').on('slideStop', function () { // when the speed slider is stopped
    statsFilter(8); // redraw our table with new stats
});

$('#range').on('slideStop', function () { // when the range slider is stopped
    statsFilter(9); // redraw our table with new stats
});

$('#favor').on('slideStop', function () { // when the favor slider is stopped
    statsFilter(10); // redraw our table with new stats
});

$('#rank').on('slideStop', function () { // when the bonus slider is stopped
    statsFilter(11); // redraw our table with new stats
});

$('#bonus').on('slideStop', function () { // when the bonus slider is stopped
    setBonusSliderVal(); // redraw our table with new stats

    for (var i = 1; i < 47; i++) {
        if ($('#tripCheck' + i).prop("checked") == true) {
            tripPlanner('reset');
            break;
        }
    };
});

function setBonusVal(slider) { // this function changes bonus text field value to slider value
    $('#bonusVal').val(slider.value); // set the bonus text field value
};

function setBonus(survStat, retrStat, speedStat, rangeStat, favorStat, rankStat) { // this function changes every row stats. Was made for bonus slider
    table.rows().every(function (rowIdx, tableLoop, rowLoop) { // every row
        data = this.data(); // get row data
        data.surv = survStat + defaultData[rowIdx][0]; // set the row surv stat
        data.retr = retrStat + defaultData[rowIdx][1]; // set the row retr stat
        data.speed = speedStat + defaultData[rowIdx][2]; // set the row speed stat
        data.range = rangeStat + defaultData[rowIdx][3]; // set the row range stat
        data.favor = favorStat + defaultData[rowIdx][4]; // set the row favor stat
        data.rank = rankStat; // set the row rank stat
        this.data(data); // set new data
    });

    statsFilter(6); // use surv filter
    statsFilter(7); // use retr filter
    statsFilter(8); // use speed filter
    statsFilter(9); // use range filter
    statsFilter(10); // use favor filter
}

function setBonusSliderVal() { // this function changes the bonus slider value to the bonus text field value and also changes data stats
    value = parseInt($('#bonusVal').val());

    if (value >= 70) {
        $('#bonus').slider('setValue', 70);
        $('#bonusVal').val(70);    
        value = 70;
    };

    if (value <= 50) {
        $('#bonus').slider('setValue', 50);
        $('#bonusVal').val(50);
        value = 50;
    };

    $('#bonus').slider('setValue', value);

    if (value == 50) {    
        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
            data = this.data();
            data.surv = defaultData[rowIdx][0];
            data.retr = defaultData[rowIdx][1];
            data.speed = defaultData[rowIdx][2];
            data.range = defaultData[rowIdx][3];
            data.favor = defaultData[rowIdx][4];
            data.rank = defaultData[rowIdx][5];
            this.data(data);
        });

        statsFilter(6);
        statsFilter(7);
        statsFilter(8);
        statsFilter(9);
        statsFilter(10);
    };

    if (value == 51) {setBonus(2, 1, 0, 0, 0, value);};
    if (value == 52) {setBonus(2, 3, 0, 1, 0, value);};
    if (value == 53) {setBonus(2, 3, 1, 2, 1, value);};
    if (value == 54) {setBonus(3, 4, 1, 3, 1, value);};
    if (value == 55) {setBonus(3, 7, 3, 3, 1, value);};
    if (value == 56) {setBonus(4, 7, 3, 5, 1, value);};
    if (value == 57) {setBonus(4, 7, 3, 7, 2, value);};
    if (value == 58) {setBonus(4, 8, 3, 8, 3, value);};
    if (value == 59) {setBonus(5, 8, 4, 9, 3, value);};
    if (value == 60) {setBonus(5, 10, 5, 10, 5, value);};
    if (value == 61) {setBonus(7, 10, 6, 10, 6, value);};
    if (value == 62) {setBonus(7, 10, 8, 12, 7, value);};
    if (value == 63) {setBonus(8, 11, 8, 12, 9, value);};
    if (value == 64) {setBonus(8, 12, 10, 14, 9, value);};
    if (value == 65) {setBonus(10, 15, 10, 15, 10, value);};
    if (value == 66) {setBonus(13, 17, 11, 15, 10, value);};
    if (value == 67) {setBonus(13, 19, 13, 17, 10, value);};
    if (value == 68) {setBonus(16, 19, 15, 17, 12, value);};
    if (value == 69) {setBonus(16, 23, 15, 19, 13, value);};
    if (value == 70) {setBonus(20, 25, 15, 20, 15, value);};
};

function defaultBonusBtn() { // Changes the bonus slider to default
    if (parseInt($('#bonusVal').val()) != 50) {
        $('#bonusVal').val(50);
        $('#bonus').slider('setValue', 50);
        setBonusSliderVal();
    }

    for (var i = 1; i < 31; i++) {
        if ($('#tripCheck' + i).prop("checked") == true) {
            tripPlanner('reset');
            break;
        }
    };
};

$("#rank").slider({
    value: [1, 70],
    ticks: [1, 15, 25, 35, 45, 50, 70],
    lock_to_ticks: true
});

// [DARK THEME]
var switcher = 0;

function darkTheme() {
	if (switcher == 0) {
		$("body").addClass("dark");
		$("#combinations").addClass("dark");
		$("#checkboxes-table").addClass("dark");
		$("#sliders-table").addClass("dark");
		$("#dark-theme-switcher").addClass("dark");
		$(".name").addClass("dark");
        $("#deepSeaSiteButton").addClass("dark");
        $("#seaOfAshButton").addClass("dark");
        $("#deepSeaSite").addClass("dark");
        $("#seaOfAsh").addClass("dark");
		switcher++;
	} else {
		$("body").removeClass("dark");
		$("#combinations").removeClass("dark");
		$("#checkboxes-table").removeClass("dark");
		$("#sliders-table").removeClass("dark");
		$("#dark-theme-switcher").removeClass("dark");
		$(".name").removeClass("dark");
        $("#deepSeaSiteButton").removeClass("dark");
        $("#seaOfAshButton").removeClass("dark");
        $("#deepSeaSite").removeClass("dark");
        $("#seaOfAsh").removeClass("dark");
		switcher--;	
	}
};

// [TRIP PLANNER DATA]
// disArray[n][n] == Distance for Survey | disArray[n][!n] == Distance to Destination (depends on the last destination position) == disArray[n][the previous destination position]
var disArray = [
[ 0,  6, 12, 15, 17, 14, 24, 10, 13, 10, 28, 16, 25, 17, 22, 23, 21, 23, 27, 26, 29, 21, 32, 23, 37, 31, 45, 39, 46, 47, 40],  //  [0] All base distances to destinations (Deep-sea Site)
[ 6, 10,  8, 10, 16, 10, 19, 13, 18, 11, 22, 14, 24, 21, 16, 19, 21, 26, 27, 25, 30, 20, 28, 19, 31, 31, 42, 34, 42, 42, 36],  //  [1] (A) The Ivory Shoals
[12,  8, 10,  6,  9,  6, 14, 12, 17, 10, 16,  7, 16, 18, 11, 11, 18, 23, 19, 20, 26, 16, 21, 14, 25, 27, 33, 27, 34, 35, 28],  //  [2] (B) Deep-sea Site 1
[15, 10,  6, 10, 14,  5, 12, 18, 23, 14, 12, 9,  20, 23,  6, 10, 20, 27, 23, 22, 28, 17, 20, 11, 21, 29, 34, 24, 32, 32, 27],  //  [3] (C) Deep-sea Site 2
[17, 16,  9, 14, 10, 16, 16, 15, 17, 15, 19, 13, 11, 19, 17, 14, 22, 26, 14, 24, 28, 23, 22, 21, 26, 30, 31, 28, 34, 35, 29],  //  [4] (D) The Lightless Basin
[14, 10,  6,  5, 16, 11, 17, 15, 20, 10, 16,  6, 19, 19,  8, 11, 15, 21, 22, 17, 23, 12, 19,  9, 24, 24, 34, 26, 33, 34, 27],  //  [5] (E) Deep-sea Site 3
[24, 19, 14, 12, 16, 17, 11, 27, 30, 24,  8, 18, 22, 32, 12, 15, 31, 37, 26, 31, 38, 28, 24, 20, 18, 38, 33, 23, 30, 29, 28],  //  [6] (F) The Southern Rimilala Trench
[10, 13, 12, 18, 15, 15, 27, 11,  5,  5, 28, 13, 18,  7, 22, 21, 13, 15, 19, 18, 20, 16, 27, 21, 36, 23, 39, 36, 42, 44, 35],  //  [7] (G) The Umrella Narrow
[13, 18, 17, 23, 17, 20, 30,  5, 12, 11, 33, 18, 20,  7, 27, 25, 17, 17, 20, 22, 23, 21, 31, 27, 40, 26, 42, 41, 46, 48, 39],  //  [8] (H) Offender's Rot
[10, 11, 10, 14, 15, 10, 24,  5, 11, 12, 25,  9, 18, 10, 18, 17, 10, 14, 19, 15, 18, 11, 23, 16, 32, 20, 37, 33, 39, 41, 32],  //  [9] (I) Neolith Island
[28, 22, 16, 12, 19, 16,  8, 28, 33, 25, 12, 17, 22, 33,  8, 10, 28, 35, 26, 27, 35, 25, 17, 14, 11, 34, 27, 15, 23, 22, 21],  // [10] (J) Unidentified Derelict
[16, 14,  7,  9, 13,  6, 18, 13, 18,  9, 17, 12, 13, 16, 10,  8, 12, 18, 16, 13, 20, 10, 15,  9, 23, 20, 29, 23, 30, 31, 23],  // [11] (K) The Cobalt Shoals
[25, 24, 16, 20, 11, 19, 22, 18, 20, 18, 22, 13, 13, 18, 20, 13, 18, 22,  3, 18, 22, 20, 15, 20, 24, 24, 22, 24, 27, 30, 21],  // [12] (L) The Mystic Basin
[17, 21, 18, 23, 19, 19, 32,  7,  7, 10, 33, 16, 18, 13, 27, 24, 11, 10, 17, 16, 15, 16, 27, 24, 38, 19, 38, 38, 43, 46, 35],  // [13] (M) Deep-sea Site 4
[22, 16, 11,  6, 17,  8, 12, 22, 27, 18,  8, 10, 20, 27, 13,  7, 21, 28, 23, 21, 28, 17, 15,  7, 15, 28, 29, 18, 26, 26, 22],  // [14] (N) The Central Rimilala Trench
[23, 19, 11, 10, 14, 11, 15, 21, 25, 17, 10,  8, 13, 24,  7, 14, 18, 25, 17, 17, 24, 16, 10,  8, 14, 24, 23, 15, 22, 24, 17],  // [15] (O) The Wreckage of Discovery I
[21, 21, 18, 20, 22, 15, 31, 13, 17, 10, 28, 12, 18, 11, 21, 18, 14,  7, 19,  5,  8,  6, 20, 16, 32, 10, 33, 31, 36, 39, 28],  // [16] (P) Komura
[23, 26, 23, 27, 26, 21, 37, 15, 17, 14, 35, 18, 22, 10, 28, 25,  7, 14, 22, 10,  6, 12, 26, 23, 39, 10, 37, 37, 42, 45, 33],  // [17] (Q) Kanayama
[27, 27, 19, 23, 14, 22, 26, 19, 20, 19, 26, 16,  3, 17, 23, 17, 19, 22, 15, 18, 21, 21, 17, 23, 27, 23, 23, 27, 29, 33, 22],  // [18] (R) Concealed Bay
[26, 25, 20, 22, 24, 17, 31, 18, 22, 15, 27, 13, 18, 16, 21, 17,  5, 10, 18, 15,  7,  7, 16, 14, 29,  7, 28, 27, 32, 34, 23],  // [19] (S) Deep-sea Site 5
[29, 30, 26, 28, 28, 23, 38, 20, 23, 18, 35, 20, 22, 15, 28, 24,  8,  6, 21,  7, 15, 12, 23, 22, 36,  4, 33, 34, 38, 41, 29],  // [20] (T) Purgatory
[21, 20, 16, 17, 23, 12, 28, 16, 21, 11, 25, 10, 20, 16, 17, 16,  6, 12, 21,  7, 12, 15, 18, 11, 28, 12, 32, 27, 34, 35, 26],  // [21] (U) Deep-sea Site 6
[32, 28, 21, 20, 22, 19, 24, 27, 31, 23, 17, 15, 15, 27, 15, 10, 20, 26, 17, 16, 23, 18, 16, 12, 14, 21, 15, 11, 16, 18,  8],  // [22] (V) The Rimilala Shelf
[23, 19, 14, 11, 21,  9, 20, 21, 27, 16, 14,  9, 20, 24,  7,  8, 16, 23, 23, 14, 22, 11, 12, 16, 18, 21, 28, 18, 26, 27, 20],  // [23] (W) Deep-sea Site 7
[37, 31, 25, 21, 26, 24, 18, 36, 40, 32, 11, 23, 24, 38, 15, 14, 32, 39, 27, 29, 36, 28, 14, 18, 16, 35, 19,  5, 12, 11, 13],  // [24] (X) Glittersand Basin
[31, 31, 27, 29, 30, 24, 38, 23, 26, 20, 34, 20, 24, 19, 28, 24, 10, 10, 23,  7,  4, 12, 21, 21, 35, 16, 32, 32, 36, 39, 27],  // [25] (Y) Flickering Dip
[45, 42, 33, 34, 31, 34, 33, 39, 42, 37, 27, 29, 22, 38, 29, 23, 33, 37, 23, 28, 33, 32, 15, 28, 19, 32, 17, 16, 11, 16,  9],  // [26] (Z) The Wreckage of the Headway
[39, 34, 27, 24, 28, 26, 23, 36, 41, 33, 15, 23, 24, 38, 18, 15, 31, 37, 27, 27, 34, 27, 11, 18,  5, 32, 16, 17,  8,  8,  9],  // [27] (AA) The Upwell
[46, 42, 34, 32, 34, 33, 30, 42, 46, 39, 23, 30, 27, 43, 26, 22, 36, 42, 29, 32, 38, 34, 16, 26, 12, 36, 11,  8, 17,  5,  8],  // [28] (AB) The Rimilala Trench Bottom
[47, 42, 35, 32, 35, 34, 29, 44, 48, 41, 22, 31, 30, 46, 26, 24, 39, 45, 33, 34, 41, 35, 18, 27, 11, 39, 16,  8,  5, 17, 12],  // [29] (AC) Stone Temple
[40, 36, 28, 27, 29, 27, 28, 35, 39, 32, 21, 23, 21, 35, 22, 17, 28, 33, 22, 23, 29, 26,  8, 20, 13, 27,  9,  9,  8, 12, 17],  // [30] (AD) Sunken Vault

[ 0,  9, 12, 14, 14, 22, 22, 19, 30, 24, 27, 26, 33, 18, 23, 17, 26, 23, 32, 25, 36],  // [31] All base distances to destinations (Sea of Ash)
[ 9, 12,  5,  6,  9, 20, 13, 11, 22, 19, 21, 17, 26, 19, 23, 18, 21, 24, 30, 22, 27],  // [32] (A) South Isle of Zozonan
[12,  5, 12, 10, 13, 23, 15, 16, 25, 23, 25, 19, 30, 25, 29, 23, 27, 27, 35, 27, 30],  // [33] (B) Wreckage of the Windwalker
[14,  6, 10, 13,  9, 21,  9,  8, 19, 19, 19, 12, 22, 18, 21, 18, 16, 26, 26, 18, 23],  // [34] (C) North Isle of Zozonan
[14,  9, 13,  9, 13, 12, 11,  6, 15, 11, 13, 15, 19, 15, 19, 11, 18, 17, 22, 15, 22],  // [35] (D) Sea of Ash 1
[22, 20, 23, 21, 12, 14, 20, 16, 17,  6, 12, 24, 19, 20, 23, 12, 26,  7, 23, 19, 25],  // [36] (E) The Southern Charnel Trench
[22, 13, 15,  9, 11, 20, 14,  6, 12, 16, 14,  4, 16, 23, 25, 21, 17, 27, 24, 18, 14],  // [37] (F) Sea of Ash 2
[19, 11, 16,  8,  6, 16,  6, 15, 11, 12, 11,  9, 14, 18, 19, 15, 14, 22, 20, 13, 17],  // [38] (G) Sea of Ash 3
[30, 22, 25, 19, 15, 17, 12, 11, 15, 10,  5, 12,  5, 25, 25, 21, 20, 24, 19, 15,  8],  // [39] (H) Ascetic's Demis
[24, 19, 23, 19, 11,  6, 16, 12, 10, 15,  5, 18, 13, 20, 22, 14, 22, 14, 20, 16, 19],  // [40] (I) The Central Charnel Trench
[27, 21, 25, 19, 13, 12, 14, 11,  5,  5, 15, 15,  7, 22, 22, 17, 19, 19, 17, 13, 14],  // [41] (J) The Catacombs of the Father
[26, 17, 19, 12, 15, 24,  4,  9, 12, 18, 15, 15, 15, 26, 26, 24, 17, 31, 24, 18, 12],  // [42] (K) Sea of Ash 4
[33, 26, 30, 22, 19, 19, 16, 14,  5, 13,  7, 15, 16, 25, 24, 22, 18, 26, 15, 13,  9],  // [43] (L) The Midden Pit
[18, 19, 25, 18, 15, 20, 23, 18, 25, 20, 22, 26, 25, 16,  5,  8, 14, 21, 17, 12, 32],  // [44] (M) The Lone Glove
[23, 23, 29, 21, 19, 23, 25, 19, 25, 22, 22, 26, 24,  5, 17, 12, 12, 24, 13, 10, 31],  // [45] (N) Coldtoe Isle
[17, 18, 23, 18, 11, 12, 21, 15, 21, 14, 17, 24, 22,  8, 12, 17, 18, 13, 18, 13, 29],  // [46] (O) Smuggler's Knot
[26, 21, 27, 16, 18, 26, 17, 14, 20, 22, 19, 17, 18, 14, 12, 18, 20, 30, 13,  8, 22],  // [47] (P) The Open Robe
[23, 24, 27, 26, 17,  7, 27, 22, 24, 14, 19, 31, 26, 21, 24, 13, 30, 20, 26, 23, 33],  // [48] (Q) Nald'thal's Pipe
[32, 30, 35, 26, 22, 23, 24, 20, 19, 20, 17, 24, 15, 17, 13, 18, 13, 26, 21,  7, 23],  // [49] (R) The Slipped Anchor
[25, 22, 27, 18, 15, 19, 18, 13, 15, 16, 13, 18, 13, 12, 10, 13,  8, 23,  7, 21, 21],  // [50] (S) Glutton's Belly
[36, 27, 30, 23, 22, 25, 14, 17,  8, 19, 14, 12,  9, 32, 31, 29, 22, 33, 23, 21, 22]]; // [51] (T) The Blue Hole

// timeArray[n][n] == Time for Survey | timeArray[n][!n] == Time to Destination (depends on the last destination position) == timeArray[n][the last destination position + 1]
var timeArray = [
[    0,  7660, 14325, 18175, 20455, 16370, 28230, 11810, 15415, 12095, 31940, 19280, 29240, 20055, 25315, 27135, 24040, 27305, 31430, 29650, 33205, 24160, 36955, 26815, 42620, 35350, 51815, 45040, 53110, 54320, 46125], //  [0] All base time to destinations (Deep-sea Site)
[ 7660, 12600,  9915, 11450, 18650, 11495, 21670, 15900, 20805, 13585, 25105, 16120, 27940, 24105, 18905, 22290, 24840, 30030, 31050, 29180, 34555, 23025, 33050, 22035, 36420, 35885, 48250, 39395, 47980, 48595, 41855], //  [1] (A) The Ivory Shoals
[14325,  9915, 12600,  7070, 11205,  7570, 16850, 14725, 19970, 11575, 18770,  8225, 18650, 21290, 12795, 13305, 20600, 26970, 22230, 23360, 29815, 19025, 24130, 16155, 28630, 31040, 38520, 31140, 39050, 40255, 32735], //  [2] (B) Deep-sea Site 1
[18175, 11450,  7070, 16800, 16835,  6455, 14080, 20885, 26585, 16505, 14140, 10620, 23170, 27275,  7580, 12375, 23760, 30985, 27170, 25460, 32960, 20050, 23600, 13220, 25060, 33215, 38805, 28160, 37045, 37300, 31695], //  [3] (C) Deep-sea Site 2
[20455, 18650, 11205, 16835, 16800, 18285, 18390, 17285, 19485, 17685, 22655, 15160, 13110, 22015, 20345, 17045, 25460, 30415, 16380, 27665, 32945, 26300, 26000, 24155, 30515, 35095, 35985, 33010, 38890, 41030, 33155], //  [4] (D) The Lightless Basin
[16370, 11495,  7570,  6455, 18285, 21000, 20250, 17140, 23395, 11660, 18825,  6965, 22345, 22710, 10255, 12915, 17825, 25035, 25700, 20080, 27215, 13970, 22470, 10645, 27855, 27470, 38855, 29655, 38275, 39095, 31495], //  [5] (E) Deep-sea Site 3
[28230, 21670, 16850, 14080, 18390, 20250, 21000, 31065, 35305, 28410, 10170, 21445, 26055, 37340, 14520, 17300, 35660, 42790, 30545, 36245, 44020, 32625, 27575, 23265, 21390, 44380, 37825, 26765, 34495, 33960, 32595], //  [6] (F) The Southern Rimilala Trench
[11810, 15900, 14725, 20885, 17285, 17140, 31065, 25200,  6430,  6230, 33025, 15540, 21340,  8535, 26030, 24260, 15805, 17800, 22230, 21650, 23715, 19005, 31495, 25060, 41145, 26805, 45040, 42175, 48850, 51230, 40645], //  [7] (G) The Umrella Narrow
[15415, 20805, 19970, 26585, 19485, 23395, 35305,  6430, 29400, 12615, 38185, 21265, 23350,  8460, 31830, 29390, 20125, 19950, 23295, 25920, 26335, 24565, 36070, 31135, 46075, 30135, 48105, 47055, 53070, 55830, 44840], //  [8] (H) Offender's Rot
[12095, 13585, 11575, 16505, 17685, 11660, 28410,  6230, 12615, 29400, 28880, 10680, 20825, 11630, 21055, 20005, 12305, 16750, 22475, 17775, 21590, 13595, 27345, 19255, 36860, 23730, 42340, 37745, 44995, 47020, 36780], //  [9] (I) Neolith Island
[31940, 25105, 18770, 14140, 22655, 18825, 10170, 33025, 38185, 28880, 33600, 19420, 25560, 37995,  9140, 12295, 32835, 40665, 30020, 31750, 40280, 28550, 20330, 16880, 12615, 39620, 31690, 17705, 26540, 25545, 24690], // [10] (J) Unidentified Derelict
[19280, 16120,  8225, 10620, 15160,  6965, 21445, 15540, 21265, 10680, 19420, 33600, 15855, 19185, 11860,  9415, 14225, 21635, 19010, 15575, 22885, 12060, 17700, 10440, 26235, 23525, 33395, 27110, 34655, 36415, 27005], // [11] (K) The Cobalt Shoals
[29240, 27940, 18650, 23170, 13110, 22345, 26055, 21340, 23350, 20825, 25560, 15855, 37800, 21205, 22990, 15620, 21590, 26145,  4545, 21080, 25825, 23590, 18110, 23005, 28095, 27725, 25540, 28055, 31680, 35330, 24370], // [12] (L) The Mystic Basin
[20055, 24105, 21290, 27275, 22015, 22710, 37340,  8535,  8460, 11630, 37995, 19185, 21205, 42000, 30915, 27385, 13245, 11900, 20410, 18835, 18025, 19160, 31675, 27985, 44100, 22070, 43825, 43960, 49465, 37615, 40410], // [13] (M) Deep-sea Site 4
[25315, 18905, 12795,  7580, 20345, 10255, 14520, 26030, 31830, 21055,  9140, 11860, 22990, 30915, 42000,  8225, 24735, 32640, 27135, 24360, 32800, 19970, 18090,  8965, 18195, 32160, 33365, 20980, 30230, 30160, 25375], // [14] (N) The Central Rimilala Trench
[27135, 22290, 13305, 12375, 17045, 12915, 17300, 24260, 29390, 20005, 12295,  9415, 15620, 27385,  8225, 46200, 21530, 29175, 19660, 20095, 28385, 18405, 11690,  9835, 16980, 28110, 26525, 18210, 25990, 27420, 19680], // [15] (O) The Wreckage of Discovery I
[24040, 24840, 20600, 23760, 25460, 17825, 35660, 15805, 20125, 12305, 32835, 14225, 21590, 13245, 24735, 21530, 46200,  8060, 21860,  6805,  9755,  7120, 23255, 18560, 37045, 11425, 37845, 35810, 41790, 44540, 32245], // [16] (P) Komura
[27305, 30030, 26970, 30985, 30415, 25035, 42790, 17800, 19950, 16750, 40665, 21635, 26145, 11900, 32640, 29175,  8060, 50400, 25150, 12385,  7890, 14545, 30100, 26595, 44720, 11740, 43005, 43170, 48385, 51575, 38535], // [17] (Q) Kanayama
[31430, 31050, 22230, 27170, 16380, 25700, 30545, 22230, 23295, 22475, 30020, 19010,  4545, 20410, 27135, 19660, 21860, 25150, 54600, 21300, 24595, 25020, 20470, 26240, 31835, 26945, 26220, 31195, 33915, 38030, 26210], // [18] (R) Concealed Bay
[29650, 29180, 23360, 25460, 27665, 20080, 36245, 21650, 25920, 17775, 31750, 15575, 21080, 18835, 24360, 20095,  6805, 12385, 21300, 54600,  8795,  8080, 18510, 17005, 33665,  8145, 32635, 31425, 36665, 39650, 26840], // [19] (S) Deep-sea Site 5
[33205, 34555, 29815, 32960, 32945, 27215, 44020, 23715, 26335, 21590, 40280, 22885, 25825, 18025, 32800, 28385,  9755,  7890, 24595,  8795, 58800, 14645, 26240, 25625, 42100,  4800, 37985, 39515, 43750, 47235, 33680], // [20] (T) Purgatory
[24160, 23025, 19025, 20050, 26300, 13970, 32625, 19005, 24565, 13595, 28550, 12060, 23590, 19160, 19970, 18405,  7120, 14545, 25020,  8080, 14645, 58800, 20695, 12715, 32895, 13970, 37090, 31860, 38865, 40840, 29850], // [21] (U) Deep-sea Site 6
[36955, 33050, 24130, 23600, 26000, 22470, 27575, 31495, 36070, 27345, 20330, 17700, 18110, 31675, 18090, 11690, 23255, 30100, 20470, 18510, 26240, 20695, 63000, 14660, 16735, 24825, 17445, 13580, 18550, 21530,  9540], // [22] (V) The Rimilala Shelf
[26815, 22035, 16155, 13220, 24155, 10645, 23265, 25060, 31135, 19255, 16880, 10440, 23005, 27985,  8965,  9835, 18560, 26595, 26240, 17005, 25625, 12715, 14660, 63000, 21350, 24215, 31950, 21485, 30120, 30830, 23130], // [23] (W) Deep-sea Site 7
[42620, 36420, 28630, 25060, 30515, 27855, 21390, 41145, 46075, 36860, 12615, 26235, 28095, 44100, 18195, 16980, 37045, 44720, 31835, 33665, 42100, 32895, 16735, 21350, 67200, 40615, 22775,  6420, 14535, 12930, 15860], // [24] (X) Glittersand Basin
[35350, 35885, 31040, 33215, 35095, 27470, 44380, 26805, 30135, 23730, 39620, 23525, 27725, 22070, 32160, 28110, 11425, 11740, 26945,  8145,  4800, 13970, 24825, 24215, 40615, 67200, 36965, 37615, 41875, 45125, 31875], // [25] (Y) Flickering Dip
[51815, 48250, 38520, 38805, 35985, 38855, 37825, 45040, 48105, 42340, 31690, 33395, 25540, 43825, 33365, 26525, 37845, 43005, 26220, 32635, 37985, 37090, 17445, 31950, 22775, 36965, 71400, 18375, 12770, 18550, 10345], // [26] (Z) The Wreckage of the Headway
[45040, 39395, 31140, 28160, 33010, 29655, 26765, 42175, 47055, 37745, 17705, 27110, 28055, 43960, 20980, 18210, 35810, 43170, 31195, 31425, 39515, 31860, 13580, 21485,  6420, 37615, 18375, 71400,  9835,  9465, 10350], // [27] (AA) The Upwell
[53110, 47980, 39050, 37045, 38890, 38275, 34495, 48850, 53070, 44995, 26540, 34655, 31680, 49465, 30230, 25990, 41790, 48385, 33915, 36665, 43750, 38865, 18550, 30120, 14535, 41875, 12770,  9835, 71400,  5795, 10100], // [28] (AB) The Rimilala Trench Bottom
[54320, 48595, 40255, 37300, 41030, 39095, 33960, 51230, 55830, 47020, 25545, 36415, 35330, 37615, 30160, 27420, 44540, 51575, 38030, 39650, 47235, 40840, 21530, 30830, 12930, 45125, 18550,  9465,  5795, 71400, 14395], // [29] (AC) Stone Temple
[46125, 41855, 32735, 31695, 33155, 31495, 32595, 40645, 44840, 36780, 24690, 27005, 24370, 40410, 25375, 19680, 32245, 38535, 26210, 26840, 33680, 29850,  9540, 23130, 15860, 31875, 10345, 10350, 10100, 14395, 71400], // [30] (AD) Sunken Vault

[    0, 11184, 14300, 16864, 16163, 25322, 25826, 22125, 34250, 27663, 31355, 30600, 37640, 20560, 26390, 19460, 29750, 26435, 37505, 29345, 41435],  // [31] All base time to destinations (Sea of Ash)
[11184, 33600,  6640,  7193, 10381, 23265, 15360, 13618, 26130, 22676, 10447, 20160, 30250, 22600, 27020, 20690, 25055, 27930, 34200, 25495, 31840],  // [32] (A) South Isle of Zozonan
[14300,  6640, 33600, 11956, 15494, 12416, 17883, 18267, 29488, 26469, 28841, 22600, 34400, 29120, 33660, 26600, 31015, 31550, 40280, 31640, 34330],  // [33] (B) Wreckage of the Windwalker
[16864,  7193, 11956, 37800, 10601, 24547, 10320,  9185, 22258, 21799, 23471, 14230, 25620, 21560, 24490, 21050, 19260, 30400, 29860, 21155, 26685],  // [34] (C) North Isle of Zozonan
[16163, 10381, 15494, 10601, 37800, 14033, 13287,  7859, 18153, 12699, 15375, 18130, 21910, 18030, 21890, 13160, 21110, 19955, 26035, 17980, 26135],  // [35] (D) Sea of Ash 1
[25322, 23265, 12416, 24547, 14033, 42000, 23746, 18736, 19502,  7674, 14151, 27810, 22740, 23360, 26790, 14210, 29805,  8690, 27000, 22365, 29595],  // [36] (E) The Southern Charnel Trench
[25826, 15360, 17883, 10320, 13287, 23746, 42000,  6968, 14258, 18371, 16393,  5420, 18500, 27110, 28700, 24750, 20470, 31555, 28325, 20885, 16930],  // [37] (F) Sea of Ash 2
[22125, 13618, 18267,  9185,  7859, 18736,  6968, 46200, 13388, 13965, 12972, 10780, 16760, 20570, 22450, 17860, 16735, 25945, 23305, 15290, 19490],  // [38] (G) Sea of Ash 3
[34250, 26130, 29488, 22258, 18153, 19502, 14258, 13388, 46200, 11842,  5985, 14400,  6540, 29010, 29200, 24440, 22840, 27790, 21950, 18180, 10225],  // [39] (H) Ascetic's Demis
[27663, 22676, 26469, 21799, 12699,  7674, 18371, 13965, 11842, 46200,  6580, 21570, 15340, 23710, 25830, 16150, 25400, 16015, 22930, 18255, 21990],  // [40] (I) The Central Charnel Trench
[31355, 10447, 28841, 23471, 15375, 14151, 16393, 12972,  5985,  6580, 46200, 18040,  8810, 25120, 25810, 19440, 22425, 22100, 19700, 15790, 16140],  // [41] (J) The Catacombs of the Father
[30600, 20160, 22600, 14230, 18130, 27810,  5420, 10780, 14400, 21570, 18040, 46200, 17480, 29850, 30410, 28400, 19960, 35825, 28125, 21565, 13800],  // [42] (K) Sea of Ash 4
[37640, 30250, 34400, 25620, 21910, 22740, 18500, 16760,  6540, 15340,  8810, 17480, 50400, 28680, 27490, 25360, 20760, 30180, 17200, 15695, 11110],  // [43] (L) The Midden Pit
[20560, 22600, 29120, 21560, 18030, 23360, 27110, 20570, 29010, 23710, 25120, 29850, 28680, 50400,  6300,  9410, 17005, 24125, 20110, 14375, 36635],  // [44] (M) The Lone Glove
[26390, 27020, 33660, 24490, 21890, 26790, 28700, 22450, 29200, 25830, 25810, 30410, 27490,  6300, 54600, 13800, 14040, 28130, 15845, 11925, 35915],  // [45] (N) Coldtoe Isle
[19460, 20690, 26600, 21050, 13160, 14210, 24750, 17860, 24440, 16150, 19440, 28400, 25360,  9410, 13800, 54600, 21380, 14960, 21055, 15295, 33640],  // [46] (O) Smuggler's Knot
[29750, 25055, 31015, 19260, 21110, 29805, 20470, 16735, 22840, 25400, 22425, 19960, 20760, 17005, 14040, 21380, 54600, 34725, 15310,  9550, 26040],  // [47] (P) The Open Robe
[26435, 27930, 31550, 30400, 19955,  8690, 31555, 25945, 27790, 16015, 22100, 35825, 30180, 24125, 28130, 14960, 34725, 56000, 30665, 26960, 37990],  // [48] (Q) Nald'thal's Pipe
[37505, 34200, 40280, 29860, 26035, 27000, 28325, 23305, 21950, 22930, 19700, 28125, 17200, 20110, 15845, 21055, 15310, 30665, 57400,  8800, 27135],  // [49] (R) The Slipped Anchor
[29345, 25495, 31640, 21155, 17980, 22365, 20885, 15290, 18180, 18255, 15790, 21565, 15695, 14375, 11925, 15295,  9550, 26960,  8800, 60200, 24370],  // [50] (S) Glutton's Belly
[41435, 31840, 34330, 26685, 26135, 29595, 16930, 19490, 10225, 21990, 16140, 13800, 11110, 36635, 35915, 33640, 26040, 37990, 27135, 24370, 61600]]; // [51] (T) The Blue Hole

// [TRIP PLANNER]
var counter = 0, // Counts how many destinations are checked
    totalTime = 0, // The total time for all checked destinations
    totalDis= 0, // The total distance for all checked destinations
    bestTrip = [], // The best trip data [totalDis, totalTime, 1st, 2nd, 3rd, 4th, 5th destination]
    des = [0], // The array of all checked destinations
    desB = [0],    
    curPosB = 0,
    maxRange = parseInt($("#rangeMaxVal").data("default")), // Get the current max range text field value
    maxSpeed = parseInt($("#speedMaxVal").val()); // Get the current max range text field value

function tripPlanner(cb) {
    if (cb != 'reset') {
        curPos = parseInt($(cb).attr('id').slice(9, 11)); // Get the selected destination position

        if (curPos >= 31) {
            curPosB = curPos - 31;
        }
    }

    if (cb.checked == true && counter < 5) {
        des.push(curPos); // Pushes the selected destination position to the array of all checked destinations
        desB.push(curPosB);
        bestTrip = [maxRange + 1]; // The range stat maximum + 1
        counter++; // Increases the destination counter

        for (var a = 1; a <= counter; a++) { // Build the best route
            for (var b = 1; b <= counter; b++) { if (counter < 2) { b = 2; };
                for (var c = 1; c <= counter; c++) { if (counter < 3) { c = 3; };
                    for (var d = 1; d <= counter; d++) { if (counter < 4) { d = 4; };
                        for (var e = 1; e <= counter; e++) { if (counter < 5) { e = 5; };
                            if (a != b && a != c && a != d && a != e && b != c && b != d && b != e && c != d && c != e && d != e) {
                                if (curPosB == 0) {
                                    totalTime = timeArray[0][des[a]] + timeArray[des[a]][des[a]];
                                    totalDis = disArray[0][des[a]] + disArray[des[a]][des[a]];
                                } else {
                                    totalTime = timeArray[31][desB[a]] + timeArray[des[a]][desB[a]];
                                    totalDis = disArray[31][desB[a]] + disArray[des[a]][desB[a]];
                                }

                                if (counter >= 2){
                                    if (curPosB == 0) {
                                        totalTime += timeArray[des[a]][des[b]] + timeArray[des[b]][des[b]];
                                        totalDis += disArray[des[a]][des[b]] + disArray[des[b]][des[b]];
                                    } else {
                                        totalTime += timeArray[des[a]][desB[b]] + timeArray[des[b]][desB[b]];
                                        totalDis += disArray[des[a]][desB[b]] + disArray[des[b]][desB[b]];                                    
                                    }

                                    if (counter >= 3){
                                        if (curPosB == 0) {
                                            totalTime += timeArray[des[b]][des[c]] + timeArray[des[c]][des[c]];
                                            totalDis += disArray[des[b]][des[c]] + disArray[des[c]][des[c]];
                                        } else {
                                            totalTime += timeArray[des[b]][desB[c]] + timeArray[des[c]][desB[c]];
                                            totalDis += disArray[des[b]][desB[c]] + disArray[des[c]][desB[c]];
                                        }

                                        if (counter >= 4){
                                            if (curPosB == 0) {
                                                totalTime += timeArray[des[c]][des[d]] + timeArray[des[d]][des[d]];
                                                totalDis += disArray[des[c]][des[d]] + disArray[des[d]][des[d]];
                                            } else {
                                                totalTime += timeArray[des[c]][desB[d]] + timeArray[des[d]][desB[d]];
                                                totalDis += disArray[des[c]][desB[d]] + disArray[des[d]][desB[d]];
                                            }

                                            if (counter >= 5){
                                                if (curPosB == 0) {
                                                    totalTime += timeArray[des[d]][des[e]] + timeArray[des[e]][des[e]];
                                                    totalDis += disArray[des[d]][des[e]] + disArray[des[e]][des[e]];
                                                } else {
                                                    totalTime += timeArray[des[d]][desB[e]] + timeArray[des[e]][desB[e]];
                                                    totalDis += disArray[des[d]][desB[e]] + disArray[des[e]][desB[e]];
                                                }
                                            };
                                        };
                                    };
                                };

                                if (totalDis < bestTrip[0]) {
                                    bestTrip = [totalDis, totalTime, a, b, c, d, e];
                                };
                            }
                        }
                    }
                }
            }
        }
        $('#rangeMinVal').val(bestTrip[0]); // Filter by min range (min range text field)
        $('#range').slider('setValue', [bestTrip[0], maxRange]); // Filter by min range (min range slider value)
        $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
        $('#rangeExactVal').val(''); // Filter by min range (min range text field)
        if ($('#speedMinVal').val() < 5) {
        	$('#speedMinVal').val(5); // Filter by min speed (min speed text field)
        	$('#speed').slider('setValue', [5, maxSpeed]); // Filter by min speed (min speed slider value)
        	$('#speedMaxVal').val(maxSpeed); // Filter by max speed (max speed text field)
        	$('#speedExactVal').val('');
        }

        setTime(bestTrip[0], bestTrip[1], counter);
    };

    if (counter == 5 && cb.checked == true) { // If there are 5 selected destinations, block all unselected checkboxes
        for (var i = 1; i < timeArray.length; i++) {
            if (i != des[1] && i != des[2] && i != des[3] && i != des[4] && i != des[5]) {
                $('#tripCheck' + i).attr("disabled", true);
            }
        }
    }

    if (cb.checked == false && (curPos == des[1] || curPos == des[2] || curPos == des[3] || curPos == des[4] || curPos == des[5])) { // If the selected destination was unchecked
        counter--; // Decreases the destinations amount counter

        for (var i = 1; i < des.length + 1; i++) { // Remove the unchecked selected destionation from the array of all checked destinations
            if (des[i] == curPos) {
                des.splice(i, 1);
                i--;

                for (var a = 1; a < desB.length + 1; a++) {
                    if (desB[a] == curPosB) {
                        desB.splice(a, 1);
                        a--;                        
                    }
                }
            }
        }

        for (var i = 1; i < timeArray.length; i++) { // Unlocks every checkbox
            $('#tripCheck' + i).removeAttr("disabled");
        }

        if (counter != 0) { // Rebuild the best route
            for (var a = 1; a <= counter; a++) {
                for (var b = 1; b <= counter; b++) { if (counter < 2) { b = 2; };
                    for (var c = 1; c <= counter; c++) { if (counter < 3) { c = 3; };
                        for (var d = 1; d <= counter; d++) { if (counter < 4) { d = 4; };
                            for (var e = 1; e <= counter; e++) { if (counter < 5) { e = 5; };
                                if (a != b && a != c && a != d && a != e && b != c && b != d && b != e && c != d && c != e && d != e) {
                                    if (curPosB == 0) {
                                        totalTime = timeArray[0][des[a]] + timeArray[des[a]][des[a]];
                                        totalDis = disArray[0][des[a]] + disArray[des[a]][des[a]];
                                    } else {
                                        totalTime = timeArray[31][desB[a]] + timeArray[des[a]][desB[a]];
                                        totalDis = disArray[31][desB[a]] + disArray[des[a]][desB[a]];
                                    }

                                    if (counter >= 2){
                                        if (curPosB == 0) {
                                            totalTime += timeArray[des[a]][des[b]] + timeArray[des[b]][des[b]];
                                            totalDis += disArray[des[a]][des[b]] + disArray[des[b]][des[b]];
                                        } else {
                                            totalTime += timeArray[des[a]][desB[b]] + timeArray[des[b]][desB[b]];
                                            totalDis += disArray[des[a]][desB[b]] + disArray[des[b]][desB[b]];                                    
                                        }

                                        if (counter >= 3){
                                            if (curPosB == 0) {
                                                totalTime += timeArray[des[b]][des[c]] + timeArray[des[c]][des[c]];
                                                totalDis += disArray[des[b]][des[c]] + disArray[des[c]][des[c]];
                                            } else {
                                                totalTime += timeArray[des[b]][desB[c]] + timeArray[des[c]][desB[c]];
                                                totalDis += disArray[des[b]][desB[c]] + disArray[des[c]][desB[c]];
                                            }

                                            if (counter >= 4){
                                                if (curPosB == 0) {
                                                    totalTime += timeArray[des[c]][des[d]] + timeArray[des[d]][des[d]];
                                                    totalDis += disArray[des[c]][des[d]] + disArray[des[d]][des[d]];
                                                } else {
                                                    totalTime += timeArray[des[c]][desB[d]] + timeArray[des[d]][desB[d]];
                                                    totalDis += disArray[des[c]][desB[d]] + disArray[des[d]][desB[d]];
                                                }

                                                if (counter >= 5){
                                                    if (curPosB == 0) {
                                                        totalTime += timeArray[des[d]][des[e]] + timeArray[des[e]][des[e]];
                                                        totalDis += disArray[des[d]][des[e]] + disArray[des[e]][des[e]];
                                                    } else {
                                                        totalTime += timeArray[des[d]][desB[e]] + timeArray[des[e]][desB[e]];
                                                        totalDis += disArray[des[d]][desB[e]] + disArray[des[e]][desB[e]];
                                                    }
                                                };
                                            };
                                        };
                                    };

                                    if (totalDis < bestTrip[0]) {
                                        bestTrip = [totalDis, totalTime, a, b, c, d, e];
                                    };
                                }
                            }
                        }
                    }
                }
            }
        } else {
            bestTrip = [0, 0];
        }

        $('#rangeMinVal').val(bestTrip[0]);
        $('#range').slider('setValue', [bestTrip[0], maxRange]);

        if (counter == 0) {
            curPosB = 0;
            $('#minRange').text(''); // Shows the full route
            $('#minRange2').text(''); // Shows the full route
            $('#result2').text(''); // Shows the full route
            $('#result').text(''); // Shows the full route
            $('#rangeMinVal').val(-65);
            $('#range').slider('setValue', [-65, maxRange]); 
            $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
            $('#rangeExactVal').val(''); // Filter by min range (min range text field)
            $('#speedMinVal').val(-20);
            $('#speed').slider('setValue', [-20, maxSpeed]); 
            $('#speedMaxVal').val(maxSpeed); // Filter by min range (min range text field)
            $('#speedExactVal').val(''); // Filter by min range (min range text field)
        }

        setTime(bestTrip[0], bestTrip[1], counter);
    }

    var route = ''; // The full route name

    for (var i = 2; i < 7; i++) { // Adds destinations to the full route
        name = $('#tripCheck' + des[bestTrip[i]]).parent().children().eq(1).text();
        if (name != '') {
            route += name + ' -> ';
        }
    }

    if (curPosB == 0 && counter != 0) {
        $('#result').text(route.slice(0, -4)); // Shows the full route
        $('#minRange').text('Min Range: ' + bestTrip[0]); // Shows the full route
        $('#minRange2').text(''); // Shows the full route   
        $('#result2').text(''); // Shows the full route
    } else if (curPosB != 0) {
        $('#result2').text(route.slice(0, -4)); // Shows the full route
        $('#minRange2').text('Min Range: ' + bestTrip[0]); // Shows the full route   
        $('#minRange').text(''); // Shows the full route   
        $('#result').text(''); // Shows the full route    
    }

    if (cb == 'reset') {
        setTime(bestTrip[0], bestTrip[1], counter);
    }
};

function setTime(range, time, counter) {
    table.rows().every(function (rowIdx, tableLoop, rowLoop) { // every row
        data = this.data(); // get row data
        spd = data.speed;

        if (data.range >= range && spd >= 5) {            
            ds = Math.trunc(time / spd / 1440 + 0.5);
            hs = Math.trunc((time / spd / 60 + 12) % 24);
            ms = Math.trunc(time / spd % 60);
            output = ds + "d " + hs + "h " + ms +"m";
            data.time = output;
        } else if (counter != 0) {
            data.time = 'Too weak';
        } else {
            data.time = '0d 12h 0m';
        }

        this.data(data); // set new data
    });

    statsFilter(8); // use speed filter
    statsFilter(9); // use range filter
};

deepSeaSiteSwitcher = 0;
ashOfSeaSwitcher = 0;

function deepSeaSiteButton() {
    if (ashOfSeaSwitcher == 1) {
    	$('#minRange2').text(''); // Shows the full route
    	$('#result2').text(''); // Shows the full route
        $('#rangeMinVal').val(-65);
        $('#range').slider('setValue', [-65, maxRange]); 
        $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
        $('#rangeExactVal').val(''); // Filter by min range (min range text field)
        $('#speedMinVal').val(-20);
        $('#speed').slider('setValue', [-20, maxSpeed]); 
        $('#speedMaxVal').val(maxSpeed); // Filter by min range (min range text field)
        $('#speedExactVal').val(''); // Filter by min range (min range text field)        

        curPosB = 0;
        bestTrip = [maxRange + 1];
        des = [0];   
        counter = 0;

        statsFilter(8); // use speed filter
        statsFilter(9); // use range filter
    }

    ashOfSeaSwitcher = 0;

    $('#seaOfAsh').collapse('hide');

    if (deepSeaSiteSwitcher == 0) {
        deepSeaSiteSwitcher++;
    } else {
        deepSeaSiteSwitcher--;
    }

    for (var i = 32; i < timeArray.length; i++) {
        if ($('#tripCheck' + i).prop('checked') == true) {
            $('#minRange2').text(''); // Shows the full route
            $('#result2').text(''); // Shows the full route
            $('#rangeMinVal').val(-65);
            $('#range').slider('setValue', [-65, maxRange]); 
            $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
            $('#rangeExactVal').val(''); // Filter by min range (min range text field)
            $('#speedMinVal').val(-20);
            $('#speed').slider('setValue', [-20, maxSpeed]); 
            $('#speedMaxVal').val(maxSpeed); // Filter by min range (min range text field)
            $('#speedExactVal').val(''); // Filter by min range (min range text field)      

            curPosB = 0;
            bestTrip = [maxRange + 1];
            des = [0];
            desB = [0];
            counter = 0;  

            statsFilter(8); // use speed filter
            statsFilter(9); // use range filter
        }

        $('#tripCheck' + i).prop('checked', false);
    };

    if (counter != 5) {
        for (var i = 1; i < timeArray.length; i++) { // Unlocks every checkbox
            $('#tripCheck' + i).removeAttr("disabled");
        }
    }
};

function ashOfSeaButton() {
    if (deepSeaSiteSwitcher == 1) {
        $('#minRange').text(''); // Shows the full route
        $('#result').text(''); // Shows the full route
        $('#rangeMinVal').val(-65);
        $('#range').slider('setValue', [-65, maxRange]); 
        $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
        $('#rangeExactVal').val(''); // Filter by min range (min range text field)
        $('#speedMinVal').val(-20);
        $('#speed').slider('setValue', [-20, maxSpeed]); 
        $('#speedMaxVal').val(maxSpeed); // Filter by min range (min range text field)
        $('#speedExactVal').val(''); // Filter by min range (min range text field)      

        curPosB = 0;
        bestTrip = [maxRange + 1];
        des = [0];
        desB = [0];
        counter = 0;  

        statsFilter(8); // use speed filter
        statsFilter(9); // use range filter
    }

    deepSeaSiteSwitcher = 0;
    $('#deepSeaSite').collapse('hide');

    if (ashOfSeaSwitcher == 0) {
        ashOfSeaSwitcher++;
    } else {
        ashOfSeaSwitcher--;
    }

    for (var i = 1; i < 31; i++) {
        if ($('#tripCheck' + i).prop('checked') == true) {
            $('#minRange').text(''); // Shows the full route
            $('#result').text(''); // Shows the full route
            $('#rangeMinVal').val(-65);
            $('#range').slider('setValue', [-65, maxRange]); 
            $('#rangeMaxVal').val(maxRange); // Filter by min range (min range text field)
            $('#rangeExactVal').val(''); // Filter by min range (min range text field)
            $('#speedMinVal').val(-20);
            $('#speed').slider('setValue', [-20, maxSpeed]); 
            $('#speedMaxVal').val(maxSpeed); // Filter by min range (min range text field)
            $('#speedExactVal').val(''); // Filter by min range (min range text field)      

            curPosB = 0;
            bestTrip = [maxRange + 1];
            des = [0];
            desB = [0];
            counter = 0;  

            statsFilter(8); // use speed filter
            statsFilter(9); // use range filter
        }

        $('#tripCheck' + i).prop('checked', false);
    };

    if (counter != 5) {
        for (var i = 1; i < timeArray.length; i++) { // Unlocks every checkbox
            $('#tripCheck' + i).removeAttr("disabled");
        }
    }
};