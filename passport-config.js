const LocalStrategy = require('passport-local').Strategy
const {pool, insertUser, findUserByEmail, findUserById} = require('./sql/mysql-config');
const bcrypt = require('bcrypt');

async function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                return done(null, false, {message: 'No user with that email'});
            }

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Password incorrect'});
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({usernameField:'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.userID))
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findUserById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    })
}

module.exports = initialize