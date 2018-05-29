ELEMENT.locale(ELEMENT.lang.en);

function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

Vue.component('appwrapper', {
    template: '#apptemplate',
    data: function () {
        return {
            keywordInput: '',
            tableData: [],
            tableLoading: false,
            currentFunction: 0,
            clearInputAfter: true,
            exportedTable: ''
        }
    },
    methods: {

        generatetable: function () {
            var table = '<table>' +
                '<tr>' +
                '<td>Keyword</td><td>Searchs per month</td><td>CPC</td><td>Competition</td></tr>';
            for (var i = 0; i < this.tableData.length; i++) {
                table = table + '<tr>' +
                    '<td>' + this.tableData[i].keyword + '</td><td>' + this.tableData[i].monthlysearch + '</td><td>' + this.tableData[i].costperclick + '</td><td>' + this.tableData[i].competition + '</td>' + '</tr>';

            }
            table = table + '</table>';

            this.$refs.exporttable.innerHTML = table;


        },
        selectElementContents: function () {
            window.getSelection().selectAllChildren(document.getElementById('tabletocopy'));
            const h = this.$createElement;
            this.$notify({
                title: 'Table Selected',
                message: h('b',  'Now press Control/Command-C to copy the table to the clipboard to be pasted in to Excel.'),
                position: 'top-right'
            });

        },
        removeduplicateobjectinarray: function (objectsArray) {
            var usedObjects = {};

            for (var i = objectsArray.length - 1; i >= 0; i--) {
                var so = JSON.stringify(objectsArray[i]);

                if (usedObjects[so]) {
                    objectsArray.splice(i, 1);

                } else {
                    usedObjects[so] = true;
                }
            }

            return objectsArray;
        },
        clearkeywordtextarea: function () {
            this.keywordInput = '';
            $('#keywordtextarea').focus();

        },

        validateAndAddLineToData: function (keyword) {
            try {
                //Below will parse lines such as : hello world [90,500/mo - $1.57 - 0.01]
                // To keyword, volume per month, CPC, and CPC Competition

                var trimmedKeyword = keyword.trim();
                // get word

                var firstWord = trimmedKeyword.split('[')[0];

                var finalFirstWord = firstWord.trim();
                //first word gotten

                //get monthly searches
                //below will provide 22,200/mo - $0.03 - 0.01]
                var tempMonthSearch = trimmedKeyword.split('[')[1];
                // so we split again which will provide us 22,200
                var finalMonthSearch = parseInt(tempMonthSearch.split('/')[0].replace(',', ''));

                //end of  finalmonth search

                //get third part
                //  \$\d*.*\d   <-- this will get $0.03 - 0.01
                var regex = /\$\d*.*\d/g;
                var tempResult = regex.exec(trimmedKeyword);


                var thirdPart = tempResult[0].split('-')[0];
                var finalCostPerClick = thirdPart.trim();


                //fourth part
                var fourthPart = tempResult[0].split('-')[1];
                var finalCompetition = fourthPart.trim();

            } catch (err) {
                return false;
            }
            if (!finalFirstWord && !finalMonthSearch && !finalCostPerClick && !finalCompetition) {
                //something went wrong when parsing one of the parts
                return false;
            } else {
                return {
                    'keyword': finalFirstWord,
                    'monthlysearch': finalMonthSearch,
                    'costperclick': finalCostPerClick,
                    'competition': finalCompetition,
                }

            }


        },
        parsekeywords: function () {
           // var textareatoclear = $('#keywordtextarea');
            var lines = $('#keywordtextarea').val().trim().split('\n');
            var that = this; // saving vue context to that
            that.tableLoading = true;
            var errorCount = 0;
            $.each(lines, function () {
                var validationResult = that.validateAndAddLineToData(this); // "this" is actually the lines keyword
                if (validationResult != false) {
                    //add to data array from object returned, else skip adding
                    //console.log(validationResult)
                    that.tableData.push(validationResult);
                } else {
                    console.log(this + ' was bad input');
                    errorCount++;
                }
            });
            if (errorCount != 0) {
                const h = this.$createElement;

                this.$notify({
                    title: 'Input Error',
                    message: h('b', {style: 'color: red'}, 'There were errors within the input data. ' + errorCount + ' entrie(s) were unable to be added due to formatting issues.'),
                    position: 'top-right'
                });
            }
            that.tableLoading = false;
            if (that.tableData.length > 0) {
                that.tableData = that.removeduplicateobjectinarray(that.tableData);

            }
            if (that.clearInputAfter == true) {

                this.keywordInput = '';

            }
        }

    }
});

new Vue({
    el: '#app',
    template: '<appwrapper></appwrapper>'
});
$(document).ready(function () {
    //When distance from top = 250px fade button in/out
    $(window).scroll(function () {
        if ($(this).scrollTop() > 250) {
            $('#scrollup').fadeIn(300);
        } else {
            $('#scrollup').fadeOut(300);
        }
    });

    //On click scroll to top of page t = 1000ms
    $('#scrollup').click(function () {
        $("html, body").animate({scrollTop: 0}, 1000);
        return false;
    });
});
