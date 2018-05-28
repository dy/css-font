'use strict'

var unquote = require('unquote')
var globalKeywords = require('css-global-keywords')
var systemFontKeywords = require('css-system-font-keywords')
var fontWeightKeywords = require('css-font-weight-keywords')
var fontStyleKeywords = require('css-font-style-keywords')
var fontStretchKeywords = require('css-font-stretch-keywords')
var splitBy = require('string-split-by')
var isSize = require('./lib/util').isSize

module.exports = function parseFont (value) {
	if (typeof value !== 'string') throw new Error('Font argument must be a string.')

	if (value === '') {
		throw new Error('Cannot parse an empty string.')
	}

	if (systemFontKeywords.indexOf(value) !== -1) {
		return { system: value }
	}

	var font = {}

	var isLocked = false
	var tokens = splitBy(value, /\s+/)

	for (var token = tokens.shift(); !!token; token = tokens.shift()) {
		if (token === 'normal' || globalKeywords.indexOf(token) !== -1) {
			['style', 'variant', 'weight', 'stretch'].forEach(function(prop) {
				font[prop] = token
			})
			isLocked = true
			continue
		}

		if (fontWeightKeywords.indexOf(token) !== -1) {
			if (isLocked) {
				continue
			}
			font.weight = token
			continue
		}

		if (fontStyleKeywords.indexOf(token) !== -1) {
			if (isLocked) {
				continue
			}
			font.style = token
			continue
		}

		if (fontStretchKeywords.indexOf(token) !== -1) {
			if (isLocked) {
				continue
			}
			font.stretch = token
			continue
		}

		if (isSize(token)) {
			var parts = splitBy(token, '/')
			font.size = parts[0]
			if (parts[1] != null) {
				font.lineHeight = parseLineHeight(parts[1])
			}
			else if (tokens[0] === '/') {
				tokens.shift()
				font.lineHeight = parseLineHeight(tokens.shift())
 			}
			if (!tokens.length) {
				throw new Error('Missing required font-family.')
			}

			font.family = splitBy(tokens.join(' '), /\s*,\s*/).map(unquote)

			return font
		}


		if (isLocked) {
			continue
		}

		if (token !== 'normal' && token !== 'small-caps') {
			throw new Error('Unknown or unsupported font token: ' + token)
		}

		font.variant = token
	}

	throw new Error('Missing required font-size.')
}


function parseLineHeight(value) {
	var parsed = parseFloat(value)
	if (parsed.toString() === value) {
		return parsed
	}
	return value
}