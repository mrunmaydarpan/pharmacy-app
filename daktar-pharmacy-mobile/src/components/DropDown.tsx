import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { AntDesign } from '@expo/vector-icons';

interface DropDownProps
{
    label?: string;
    placeholder?: string;
    options: Array<{ label: string; value: any }>;
    selectedValue: any;
    onSelect: (value: any) => void;
    disabled?: boolean;
    multiSelect?: boolean;
}

export default function DropDown({
    label,
    placeholder,
    options,
    selectedValue,
    onSelect,
    disabled = false,
    multiSelect = false,
}: DropDownProps)
{

    const renderItem = (item: any) =>
    {
        const isSelected = multiSelect
            ? (selectedValue || []).includes(item.value)
            : selectedValue === item.value;

        return (
            <View style={[styles.item, isSelected && styles.selectedItem]}>
                <Text style={[styles.textItem, isSelected && styles.selectedTextItem]}>
                    {item.label}
                </Text>
                {isSelected && (
                    <AntDesign
                        style={styles.icon}
                        color={styles.selectedTextItem.color}
                        name="check-circle"
                        size={18}
                    />
                )}
            </View>
        );
    };

    const renderDropdown = () =>
    {
        if (multiSelect)
        {
            return (
                <MultiSelect
                    style={styles.dropdownButton}
                    placeholderStyle={styles.placeholderText}
                    data={options}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={placeholder}
                    searchPlaceholder="Search..."
                    value={selectedValue || []}
                    onChange={(item) =>
                    {
                        onSelect(item);
                    }}
                    renderItem={renderItem}
                    selectedStyle={styles.selectedChip}
                    selectedTextStyle={styles.selectedChipText}
                    activeColor="#f0f9ff"
                />
            );
        }

        return (
            <Dropdown
                style={styles.dropdownButton}
                placeholderStyle={styles.placeholderText}
                data={options}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={placeholder}
                searchPlaceholder="Search..."
                value={selectedValue}
                onChange={(item) =>
                {
                    onSelect(item.value);
                }}
                renderItem={renderItem}
                activeColor="#f0f9ff"
            />
        );
    };

    return (
        <View style={styles.container}>
            {renderDropdown()}
        </View>
    );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    dropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    item: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedItem: {
        backgroundColor: '#f0f9ff',
    },
    textItem: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    selectedTextItem: {
        color: '#0094b8',
        fontWeight: '600',
    },
    icon: {
        marginRight: 5,
    },
    selectedChip: {
        backgroundColor: '#e0f2fe',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#bae6fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 8,
        marginRight: 8,
    },
    selectedChipText: {
        fontSize: 13,
        color: '#0369a1',
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: '#f5f5f5',
        borderColor: '#eee',
    },
    dropdownText: {
        fontSize: 14,
        color: '#1a1a1a',
        flex: 1,
    },
    placeholderText: {
        color: '#999',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.7,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    closeIcon: {
        fontSize: 20,
        color: '#666',
    },
    optionItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    selectedOptionItem: {
        backgroundColor: '#f0f9ff',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#0094b8',
        fontWeight: '600',
    },
});

