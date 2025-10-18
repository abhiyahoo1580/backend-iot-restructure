var generator = require('generate-password');

function generators() {
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    return password;
}
module.exports = {
    generators
}