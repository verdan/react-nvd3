'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _nvd = require('nvd3');

var _nvd2 = _interopRequireDefault(_nvd);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SETTINGS = ['x', 'y', 'type', 'datum', 'configure'];
var SIZE = ['width', 'height'];
var MARGIN = 'margin';
var LEGEND = 'legend';
var TOOLTIP = 'tooltip';
var CONTAINER_STYLE = 'containerStyle';

var RENDER_START = 'renderStart';
var ELEMENT_CLICK = 'elementClick';
var RENDER_END = 'renderEnd';
var READY = 'ready';

var NVD3Chart = function (_React$Component) {
	_inherits(NVD3Chart, _React$Component);

	function NVD3Chart() {
		_classCallCheck(this, NVD3Chart);

		// bind "this" at constructor stage so that function is available to be removed from window resize event on unmount
		var _this = _possibleConstructorReturn(this, (NVD3Chart.__proto__ || Object.getPrototypeOf(NVD3Chart)).call(this));

		_this.resize = _this.resize.bind(_this);
		return _this;
	}

	/**
  * Instantiate a new chart setting
  * a callback if exists
  */


	_createClass(NVD3Chart, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this2 = this;

			_nvd2.default.addGraph(this.renderChart.bind(this), function (chart) {
				if ((0, _utils.isCallable)(_this2.props.ready)) _this2.props.ready(chart, READY);
			});
		}

		/**
   * Update the chart after state is changed.
   */

	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.renderChart();
		}

		/**
   * Remove listeners
   */

	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			if (this.resizeHandler) clearTimeout(this.resizeHandler);
			if (window.removeEventListener) window.removeEventListener("resize", this.resize);else window.detachEvent("resize", this.resize);
		}

		/**
   * Creates a chart model and render it
   */

	}, {
		key: 'renderChart',
		value: function renderChart() {
			var dispatcher = void 0;

			// We try to reuse the current chart instance. If not possible then lets instantiate again
			this.chart = this.chart && !this.rendering ? this.chart : _nvd2.default.models[this.props.type]();

			if ((0, _utils.isCallable)(this.props.renderStart)) this.props.renderStart(this.chart, RENDER_START);

			this.parsedProps = (0, _utils.bindFunctions)(this.props, this.props.context);

			this.chart.x && this.chart.x((0, _utils.getValueFunction)(this.parsedProps.x, 'x'));
			this.chart.y && this.chart.y((0, _utils.getValueFunction)(this.parsedProps.y, 'y'));
			this.props.margin && this.chart.margin(this.options(MARGIN, _utils.pick).margin || (0, _utils.propsByPrefix)('margin', this.props) || {});

			// Configure componentes recursively
			this.configureComponents(this.chart, this.options(SETTINGS.concat(CONTAINER_STYLE), _utils.without));

			// hook for configuring the chart
			!this.props.configure || this.props.configure(this.chart);

			// Render chart using d3
			this.selection = _d2.select(this.refs.svg).datum(this.props.datum).call(this.chart);

			// Update the chart if the window size change.
			// Save resizeHandle to remove the resize listener later.
			if (!this.resizeHandler) if (window.addEventListener) window.addEventListener("resize", this.resize, false);else window.attachEvent("resize", this.resize, false);

			// PieCharts and lineCharts are an special case. Their dispacher is the pie component inside the chart.
			// There are some charts do not feature the renderEnd event
			switch (this.props.type) {
				case 'multiBarChart':
					dispatcher = this.chart.multibar.dispatch;
					break;
				case 'pieChart':
					dispatcher = this.chart.pie.dispatch;
					break;
				case 'lineChart':
				case 'linePlusBarChart':
					dispatcher = this.chart.lines.dispatch;
					break;
				default:
					dispatcher = this.chart.dispatch;
			}

			dispatcher.renderEnd && dispatcher.on('renderEnd', this.renderEnd.bind(this));
			dispatcher.elementClick && dispatcher.on('elementClick', this.elementClick.bind(this));
			this.rendering = true;

			return this.chart;
		}

		/**
   * Render end callback function
   * @param  {Event} e
   */

	}, {
		key: 'renderEnd',
		value: function renderEnd(e) {
			if ((0, _utils.isCallable)(this.props.renderEnd)) this.props.renderEnd(this.chart, RENDER_END);
			// Once renders end then we set rendering to false to allow to reuse the chart instance.
			this.rendering = false;
		}

		/**
   * element click callback function
   * @param  {Event} e
   */

	}, {
		key: 'elementClick',
		value: function elementClick(e) {
			if ((0, _utils.isCallable)(this.props.elementClick)) this.props.elementClick(e, 'elementClick');
		}

		/**
   * Configure components recursively
   * @param {nvd3 chart} chart  A nvd3 chart instance
   * @param {object} options    A key value object
   */

	}, {
		key: 'configureComponents',
		value: function configureComponents(chart, options) {
			for (var optionName in options) {
				var optionValue = options[optionName];
				if (chart) {
					if ((0, _utils.isPlainObject)(optionValue)) {
						this.configureComponents(chart[optionName], optionValue);
					} else if (typeof chart[optionName] === 'function') {
						chart[optionName](optionValue);
					}
				}
			}
		}

		/**
   * Filter options base on predicates
   * @param {Array} keys          An array of keys to preserve or remove
   * @param {Function} predicate  The function used to filter keys
   */

	}, {
		key: 'options',
		value: function options(keys, predicate) {
			// DEPRECATED: this.props.chartOptions
			var opt = this.parsedProps.options || this.parsedProps || this.props.chartOptions;
			predicate = predicate || _utils.pick;
			return predicate(opt, keys);
		}

		/**
   * element resize callback function
   * @param  {Event} e
   */

	}, {
		key: 'resize',
		value: function resize(e) {
			var _this3 = this;

			clearTimeout(this.resizeHandler);
			this.resizeHandler = setTimeout(function () {
				clearTimeout(_this3.resizeHandler);
				if (_this3.chart && typeof _this3.chart.update === "function") _this3.chart.update();
			}, 250);
		}

		/**
   * Render function
   * svg element needs to have height and width.
   */

	}, {
		key: 'render',
		value: function render() {
			var size = (0, _utils.pick)(this.props, SIZE);
			var style = Object.assign({}, size, this.props.containerStyle);
			return _react2.default.createElement(
				'div',
				{ ref: 'root', className: 'nv-chart', style: style },
				_react2.default.createElement('svg', _extends({ ref: 'svg' }, size))
			);
		}
	}]);

	return NVD3Chart;
}(_react2.default.Component);

exports.default = NVD3Chart;


NVD3Chart.propTypes = {
	type: _react2.default.PropTypes.string.isRequired,
	configure: _react2.default.PropTypes.func
};

// Babel 6 issue: http://stackoverflow.com/questions/33505992/babel-6-changes-how-it-exports-default
module.exports = NVD3Chart;
