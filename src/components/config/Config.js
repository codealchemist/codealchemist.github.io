export default class Config {
  constructor () {
    this.configMap = {
      // development
      'localhost': {
        imgUrl: '//localhost:8080'
      },

      // prod
      'albertomiranda.herokuapp.com': {
        imgUrl: '//albertomiranda.herokuapp.com/img'
      }
    }
  }
}
