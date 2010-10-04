/**
 * Creates new DateRange
 * 
 * @param {Date} beginDate
 * @param {Date} endDate
 */
function DateRange(beginDate, endDate) {
  this.beginDate = beginDate;
  this.endDate = endDate;
}

DateRange.prototype = {
  /**
   * Return beginning date of range
   * @return {Date}
   */
  'beg': function() {
    return this.beginDate;
  },
  
  /**
   * Return end date of range
   * @return {Date}
   */
  "end": function() {
    return this.endDate;
  }
};

/**
 * Foo
 */
var foo = function () {};


