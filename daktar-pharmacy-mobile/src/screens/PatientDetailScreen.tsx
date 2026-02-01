import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import apiService from '../services/apiService';
import { Patient } from '../types';

export default function PatientDetailScreen({ route, navigation }: any) {
  console.log(route.params);

  const { patientId } = route.params;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPatientById(patientId);
      const patientData = response.data.data || response.data;
      setPatient(patientData);
      populateForm(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to load patient details');
      } else {
        Alert.alert('Error', 'Failed to load patient details');
      }
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: Patient) => {
    setName(data.name || '');
    setPhone(data.phone || '');
    setEmail(data.email || '');
    setAge(data.age ? data.age.toString() : '');
    setGender(data.gender || 'male');
    setAddress(data.address || '');
    setCity(data.city || '');
    setState(data.state || '');
    setPinCode(data.pin_code || '');
    setBloodGroup(data.blood_group || '');
  };

  const handleUpdate = async () => {
    if (!name || !phone) {
      if (Platform.OS === 'web') {
        window.alert('Name and phone are required');
      } else {
        Alert.alert('Error', 'Name and phone are required');
      }
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        name,
        phone,
        email: email || undefined,
        age: age ? parseInt(age) : undefined,
        gender,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pin_code: pinCode || undefined,
        blood_group: bloodGroup || undefined,
      };

      await apiService.updatePatient(patientId, updatedData);

      if (Platform.OS === 'web') {
        window.alert('Patient updated successfully');
      } else {
        Alert.alert('Success', 'Patient updated successfully');
      }
      setEditing(false);
      loadPatient();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update patient';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this patient?');
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Patient', 'Are you sure you want to delete this patient?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  const performDelete = async () => {
    try {
      await apiService.deletePatient(patientId);
      if (Platform.OS === 'web') {
        window.alert('Patient deleted successfully');
      } else {
        Alert.alert('Success', 'Patient deleted successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete patient';
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0094b8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {!editing ? (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              setEditing(false);
              if (patient) populateForm(patient);
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.formContainer}>
        {/* Name */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Patient name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Phone */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={editing}
            placeholder="Phone number"
            placeholderTextColor="#999"
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={editing}
            placeholder="Email address"
            placeholderTextColor="#999"
          />
        </View>

        {/* Age & Gender Row */}
        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={editing}
              placeholder="Age"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Gender</Text>
            {editing ? (
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>F</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'other' && styles.genderButtonActive]}
                  onPress={() => setGender('other')}
                >
                  <Text style={[styles.genderText, gender === 'other' && styles.genderTextActive]}>O</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.valueText}>{gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Blood Group */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Blood Group</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
            editable={editing}
            placeholder="e.g. O+, A+, B-, AB+"
            placeholderTextColor="#999"
          />
        </View>

        {/* Address */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea, !editing && styles.inputDisabled]}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            editable={editing}
            placeholder="Full address"
            placeholderTextColor="#999"
          />
        </View>

        {/* City & State Row */}
        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={city}
              onChangeText={setCity}
              editable={editing}
              placeholder="City"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={state}
              onChangeText={setState}
              editable={editing}
              placeholder="State"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* PIN Code */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>PIN Code</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={pinCode}
            onChangeText={setPinCode}
            keyboardType="number-pad"
            editable={editing}
            placeholder="PIN code"
            placeholderTextColor="#999"
          />
        </View>

        {/* Created Date */}
        {patient?.created_at && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{new Date(patient.created_at).toLocaleDateString()}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0094b8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#0094b8',
    borderColor: '#0094b8',
  },
  genderText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#fff',
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
});
