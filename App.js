import React, { Component } from 'react';

import {View} from 'react-native';

import {
	StackNavigator,
} from 'react-navigation';

import Overview from './app/components/overview/Overview';
import Internal from './app/components/internal/Internal';

const Navigator = StackNavigator(
	{
		Overview: {
			screen: Overview,
			navigationOptions:{
				title: 'Overview',
				header: null,
			},
		},
		Internal: {
			screen: Internal,
			navigationOptions: ({ navigation }) => ({
		   	title: navigation.state.params.name,
		   }),
		},
	},
	{
		navigationOptions:{
			headerTintColor: '#fff',
			headerStyle:{
				backgroundColor: '#1c1c1c',
			},
			headerTitleStyle: {
				color: '#fff',
			},
		},
		initialRouteName: 'Overview',
	}
);

export default class App extends React.Component {
	render(){
		return(
			<Navigator/>
		);
	}
}
