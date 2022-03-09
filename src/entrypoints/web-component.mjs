import { render, h, options } from 'preact';
import register from 'preact-custom-element';
import Component from './component.mjs';

register(Component, TAG_NAME, PROP_NAMES);
