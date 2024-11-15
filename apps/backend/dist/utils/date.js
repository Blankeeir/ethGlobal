"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getTimestampTodayTomorrow", {
    enumerable: true,
    get: function() {
        return getTimestampTodayTomorrow;
    }
});
const getTimestampTodayTomorrow = ()=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
        today,
        tomorrow
    };
};

//# sourceMappingURL=date.js.map