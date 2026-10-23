import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  Animated,
  BackHandler,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  Pencil,
  RefreshCw,
  Home,
  Landmark,
  Lightbulb,
  Info,
  X,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import useUserLocation from '../hooks/useLocation';
import {
  analyzeImage,
  createComplaint,
  checkDuplicate,
  detectAuthority,
  translateLetter,
  checkCanSubmit,
  extractLocationFromImage,
  reverseGeocodeLocation,
} from '../services/api';
import { getDepartment } from '../utils/departments';
import { generateDeterministicLetter, getTemplateType, TEMPLATE_TYPES } from '../utils/complaintTemplates';
import { LANGUAGES, AUTHORITY_TYPES } from '../constants/languages';
import { copyToClipboard } from '../utils/clipboard';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import LocationDetector from '../components/LocationDetector';
import DuplicateModal from '../components/DuplicateModal';
import CustomHeader from '../components/CustomHeader';
import HorizontalChipSelector from '../components/HorizontalChipSelector';
import { useChatbot } from '../context/ChatbotContext';
import Toast from 'react-native-toast-message';
import { TABLET_MAX_WIDTH } from '../constants/layout';
import LeafletMap from '../components/LeafletMap';

const PROBLEM_TYPES = [
  'Pothole',
  'Garbage Dump',
  'Streetlight Fault',
  'Water Leakage',
  'Broken Drainage',
  'Fallen Tree',
  'Public Toilet',
  'Traffic Signal',
  'Other',
];

const SEVERITIES = [
  { key: 'Low', color: '#059669', bgUnselected: '#ECFDF5' },
  { key: 'Medium', color: '#D97706', bgUnselected: '#FFFBEB' },
  { key: 'High', color: '#DC2626', bgUnselected: '#FEF2F2' },
];

const defaultCenter = { latitude: 28.6139, longitude: 77.2090, latitudeDelta: 0.05, longitudeDelta: 0.05 };

const SubmitScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const categoryParam = route.params?.category;
  const { userData } = useAuth();
  const userLoc = useUserLocation();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 600;

  const [step, setStep] = useState(1); // 1 = Upload, 2 = Analyzing, 3 = Review, 4 = Success
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    problemType: '',
    severity: 'Medium',
    description: '',
    formalLetter: '',
    department: '',
  });

  // Category pre-selection from Home Screen category cards
  useEffect(() => {
    if (categoryParam) {
      let mappedType = 'Other';
      if (categoryParam === 'Pothole') mappedType = 'Pothole';
      else if (categoryParam === 'Garbage') mappedType = 'Garbage Dump';
      else if (categoryParam === 'Street Light') mappedType = 'Streetlight Fault';
      else if (categoryParam === 'Drainage') mappedType = 'Broken Drainage';
      else if (categoryParam === 'Water Supply') mappedType = 'Water Leakage';
      else if (categoryParam === 'Park Maintenance') mappedType = 'Fallen Tree';
      else if (categoryParam === 'Electricity') mappedType = 'Streetlight Fault';
      else if (categoryParam === 'Other') mappedType = 'Other';

      setFormData((prev) => ({
        ...prev,
        problemType: mappedType,
        department: getDepartment(mappedType),
      }));
    }
  }, [categoryParam]);

  // Duplicate detection
  const [duplicateResults, setDuplicateResults] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [complaintEmbedding, setComplaintEmbedding] = useState(null);

  // Map & Location
  const [markerPos, setMarkerPos] = useState({ latitude: 28.6139, longitude: 77.2090 });
  const [mapRegion, setMapRegion] = useState(defaultCenter);
  const [exifStatus, setExifStatus] = useState('idle');
  const [exifSource, setExifSource] = useState('');
  const [exifAddress, setExifAddress] = useState(null);
  const [locationSource, setLocationSource] = useState('BROWSER_GPS');

  // Auto-acquire live phone GPS on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const newPos = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setMarkerPos(newPos);
          setMapRegion({ ...newPos, latitudeDelta: 0.01, longitudeDelta: 0.01 });
          setLocationSource('BROWSER_GPS');
          fetchAuthority(pos.coords.latitude, pos.coords.longitude);
          try {
            const geoRes = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
            if (geoRes.data) {
              setExifAddress(geoRes.data);
              setExifStatus('found');
              setExifSource('BROWSER_GPS');
            }
          } catch {}
        }
      } catch (err) {
        // Location detection error fallback
      }
    })();
  }, []);

  // Authority
  const [authorityInfo, setAuthorityInfo] = useState(null);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authorityOverride, setAuthorityOverride] = useState('');
  const [showAuthorityPicker, setShowAuthorityPicker] = useState(false);

  // Translation & Canonical Letter
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [canonicalEnglishLetter, setCanonicalEnglishLetter] = useState('');
  const [translatedLetter, setTranslatedLetter] = useState('');
  const [translating, setTranslating] = useState(false);

  // AI Detections & Image Validation Rejection Modal
  const [detections, setDetections] = useState([]);
  const [analysisProvider, setAnalysisProvider] = useState('yolo');
  const [geminiFallback, setGeminiFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState('');
  const [analysisStageText, setAnalysisStageText] = useState('Scanning with Local YOLO11n Model...');
  const [analysisSubtitleText, setAnalysisSubtitleText] = useState('Direct on-server neural inference · zero cloud latency');
  const [imageValidation, setImageValidation] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDetectedContent, setRejectionDetectedContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);

  const insets = useSafeAreaInsets();
  const { setIsVisible: setChatbotVisible, setBottomOffset: setChatbotBottomOffset } = useChatbot();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [letterInputHeight, setLetterInputHeight] = useState(160);

  // Map state & gesture handling
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  const [isMapDragging, setIsMapDragging] = useState(false);

  // Stepper Animation
  const progressAnim = useRef(new Animated.Value(step)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [step]);

  // Hardware Back Button handling
  useEffect(() => {
    const onBackPress = () => {
      if (showDuplicateModal) {
        setShowDuplicateModal(false);
        return true;
      }
      if (step > 1 && step < 4) {
        setStep((s) => s - 1);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [showDuplicateModal, step]);

  // Dynamic Chatbot elevation and modal hiding
  useEffect(() => {
    if (step === 3) {
      setChatbotBottomOffset(76);
    } else {
      setChatbotBottomOffset(0);
      setChatbotVisible(true);
    }
    return () => {
      setChatbotBottomOffset(0);
      setChatbotVisible(true);
    };
  }, [step]);

  useEffect(() => {
    if (showDuplicateModal) {
      setChatbotVisible(false);
    } else if (step === 3) {
      setChatbotVisible(true);
    }
  }, [showDuplicateModal]);

  useEffect(() => {
    let timer;
    if (step === 3 && mapLoading && !mapError) {
      timer = setTimeout(() => {
        setMapLoading(false);
        setMapError(true);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [step, mapLoading, mapError, mapRetryKey]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Trigger GPS detection on mount
  useEffect(() => {
    userLoc.detectLocation();
  }, []);

  useEffect(() => {
    if (userLoc.lat && userLoc.lng) {
      const pos = { latitude: userLoc.lat, longitude: userLoc.lng };
      setMarkerPos(pos);
      setMapRegion({ ...pos, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      fetchAuthority(userLoc.lat, userLoc.lng);
    }
  }, [userLoc.lat, userLoc.lng]);

  const isGenericCity = (s) => !s || /^(?:kolhapur|pune|maharashtra|india|local village|unnamed)$/i.test(String(s).trim());

  const cleanAddressString = (addrStr) => {
    if (!addrStr || typeof addrStr !== 'string') return '';
    return addrStr
      .replace(/,?\s*(?:in\s+)?pune\s+division\b/gi, '')
      .replace(/,?\s*\bin\s+pune\b/gi, '')
      .replace(/,?\s*(?:in\s+)?[A-Za-z]+\s+division\b/gi, '')
      .replace(/\bdivision\b/gi, '')
      .replace(/\b(?:mun[a-z]+)\s+corporation\b/gi, '')
      .replace(/\b(?:mun[a-z]+)\s+council\b/gi, '')
      .replace(/\b(?:gram\s+panchayat|nagar\s+palika|nagar\s+parishad|mahanagar\s+palika)\b/gi, '')
      .replace(/\bunnamed\s*,?\s*/gi, '')
      .replace(/\s*\bin\b(?=\s*,|\s*$|\s+kolhapur|\s+maharashtra)/gi, '')
      .replace(/\bin\s*$/gi, '')
      .replace(/,?\s*[A-Z0-9]{2,}-[A-Z0-9]+/g, '')
      .replace(/\s*,\s*,/g, ', ')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();
  };

  const cleanPlaceName = (name) => {
    if (!name || typeof name !== 'string') return '';
    let trimmed = name.trim();
    trimmed = trimmed
      .replace(/,?\s*(?:in\s+)?pune\s+division\b/gi, '')
      .replace(/,?\s*\bin\s+pune\b/gi, '')
      .replace(/,?\s*(?:in\s+)?[A-Za-z]+\s+division\b/gi, '')
      .replace(/\bdivision\b/gi, '')
      .replace(/\b(?:mun[a-z]+)\s+corporation\b/gi, '')
      .replace(/\b(?:mun[a-z]+)\s+council\b/gi, '')
      .replace(/\b(?:gram\s+panchayat|nagar\s+palika|nagar\s+parishad|mahanagar\s+palika)\b/gi, '')
      .replace(/\s*\bin\b(?=\s*,|\s*$|\s+kolhapur|\s+maharashtra)/gi, '')
      .replace(/\bin\s*$/gi, '')
      .replace(/,?\s*[A-Z0-9]{2,}-[A-Z0-9]+/g, '')
      .replace(/\s*,\s*,/g, ', ')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();

    if (/^[A-Z0-9]{2,}-[A-Z0-9]+$/i.test(trimmed)) return '';
    if (/[0-9]{3,}/.test(trimmed)) return '';
    if (/^[0-9]+/.test(trimmed)) return '';
    if (/\+/.test(trimmed)) return '';
    if (/^unnamed$/i.test(trimmed)) return '';

    // Strip thoroughfare suffixes rather than discarding the whole place name
    // e.g. "Padli Khurd Road" -> "Padli Khurd", "Shingnapur Highway" -> "Shingnapur"
    trimmed = trimmed
      .replace(/\b(?:road|street|marg|rasta|lane|gali|path|highway|nh\s*\d+|sh\s*\d+|bypass|chowk|circle|bridge|flyover)\b/gi, '')
      .replace(/^[\s,]+|[\s,]+$/g, '')
      .trim();

    if (/^(?:main|near|opp|opposite|behind|front|beside|across|old|new|in|at)$/i.test(trimmed)) return '';

    return trimmed;
  };

  const fetchAuthority = async (lat, lng) => {
    setAuthorityLoading(true);
    try {
      // 1. Device-native reverse geocoding via expo-location (uses Android Geocoder directly)
      let clientAddress = null;
      let villageCandidate = '';
      try {
        const geoResults = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geoResults && geoResults.length > 0) {
          const g = geoResults[0];
          const subLoc = cleanPlaceName(g.subLocality);
          const cleanName = cleanPlaceName(g.name);
          const cleanStreet = cleanPlaceName(g.street);
          const candidateCity = cleanPlaceName(g.city);
          villageCandidate = (!isGenericCity(subLoc) ? subLoc : '') ||
                             (!isGenericCity(candidateCity) ? candidateCity : '') ||
                             (!isGenericCity(cleanName) ? cleanName : '') || '';
          const area = villageCandidate || cleanStreet || candidateCity || '';
          const city = candidateCity || '';
          let dist = cleanPlaceName(g.district || g.subregion) || '';
          if (!dist || /division/i.test(dist)) dist = 'Kolhapur';
          const reg = cleanPlaceName(g.region) || 'Maharashtra';

          clientAddress = {
            village: villageCandidate,
            town: '',
            city: city,
            suburb: subLoc || cleanName || '',
            district: dist,
            taluka: '',
            state: reg,
            postcode: g.postalCode || '',
            formattedAddress: cleanAddressString([villageCandidate || cleanStreet || city, dist, reg].filter(Boolean).join(', ')),
          };
        }
      } catch (locErr) {
        console.warn('Device native geocode error:', locErr);
      }

      // 2. High-speed client fallback via BigDataCloud directly from phone connection
      if (!clientAddress || (!clientAddress.village && !clientAddress.city)) {
        try {
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (bdcRes.ok) {
            const bdc = await bdcRes.json();
            const admin = bdc.localityInfo?.administrative || [];
            let dist = '', tal = '';
            for (const item of admin) {
              if (item.adminLevel === 5) dist = item.name.replace(/\s*district$/i, '').trim();
              if (item.adminLevel === 6 && item.name.toLowerCase().includes('taluka')) {
                tal = item.name.replace(/\s*taluka$/i, '').trim();
              }
            }
            const cleanDist = (dist && !/division/i.test(dist)) ? dist : 'Kolhapur';
            clientAddress = {
              village: bdc.locality || '',
              town: bdc.locality || '',
              city: bdc.city || '',
              suburb: '',
              district: cleanDist,
              taluka: tal || '',
              state: bdc.principalSubdivision || 'Maharashtra',
              postcode: bdc.postcode || '',
              formattedAddress: cleanAddressString([bdc.locality || bdc.city, cleanDist, bdc.principalSubdivision || 'Maharashtra'].filter(Boolean).join(', ')),
            };
          }
        } catch (webErr) {
          console.warn('Client BDC geocode error:', webErr);
        }
      }

      // Dynamic local calculation so UI updates with 0ms lag on pin movement
      const knownUrbanWards = [
        'shahupuri', 'rajarampuri', 'laxmipuri', 'tarabai park', 'kasba bawada', 'kasaba bawada', 'bawada',
        'raman mala', 'ramanmala', 'phulewadi', 'rankala', 'shivaji peth', 'nagala park',
        'ruikar colony', 'kadamwadi', 'line bazar', 'pratibha nagar', 'dabholkar corner',
        'cbs', 'dasara chowk', 'bindu chowk', 'new palace', 'temblaiwadi', 'subhashnagar'
      ];
      const checkText = `${villageCandidate} ${clientAddress?.village || ''} ${clientAddress?.suburb || ''} ${clientAddress?.city || ''} ${clientAddress?.formattedAddress || ''}`.toLowerCase();

      const isUrban = knownUrbanWards.some(w => checkText.includes(w));
      const isRural = !isUrban && (
        [
          'shinganapur', 'singanapur', 'shingnapur', 'padli khurd', 'padli budruk', 'padli',
          'balinge', 'shiroli', 'uchgaon', 'uchgoan', 'vadanage', 'vadange', 'nigave',
          'chikhali', 'kerli', 'kerle', 'prayag chikhali', 'gandhinagar', 'kalamba',
          'pachgaon', 'morewadi', 'gokul shirgaon', 'tamgaon', 'kagal', 'kuditre', 'khupire',
          'koparde', 'kale', 'kotoli', 'beed', 'panhala', 'sawarde', 'vashi', 'nandgaon'
        ].some(gp => checkText.includes(gp)) ||
        /khurd|budruk|pur|wadi|vadi|gaon|goan|khed|pada/i.test(checkText) ||
        (lat && lng && (lng < 74.205 || lng > 74.260 || lat < 16.670 || lat > 16.735))
      );

      const rawCandidate =
        (!isGenericCity(villageCandidate) ? villageCandidate : '') ||
        (!isGenericCity(clientAddress?.village) ? clientAddress?.village : '') ||
        (!isGenericCity(clientAddress?.suburb) ? clientAddress?.suburb : '') ||
        (!isGenericCity(clientAddress?.formattedAddress?.split(',')[0]) ? clientAddress?.formattedAddress?.split(',')[0] : '') ||
        '';
      const cleanCandidate = cleanPlaceName(rawCandidate);
      const vName = !isGenericCity(cleanCandidate) ? cleanCandidate : 'Local Village';

      if (isRural && !isUrban) {
        setAuthorityInfo({
          authorityType: 'gram_panchayat',
          authorityTitle: 'The Sarpanch',
          authorityBody: `Gram Panchayat ${vName}`,
          displayAddress: clientAddress?.formattedAddress || 'Kolhapur, Maharashtra',
          letterHeader: `To,\nThe Sarpanch,\nGram Panchayat ${vName},\nDistrict Kolhapur, Maharashtra`,
        });
        setAuthorityOverride('gram_panchayat');
      } else {
        setAuthorityInfo({
          authorityType: 'municipal_corporation',
          authorityTitle: 'The Municipal Commissioner',
          authorityBody: 'Municipal Corporation Kolhapur',
          displayAddress: clientAddress?.formattedAddress || 'Kolhapur, Maharashtra',
          letterHeader: 'To,\nThe Municipal Commissioner,\nMunicipal Corporation Kolhapur,\nDistrict Kolhapur, Maharashtra',
        });
        setAuthorityOverride('municipal_corporation');
      }

      const res = await detectAuthority(lat, lng, clientAddress);
      if (res?.data) {
        const cleanBody = cleanAddressString(res.data.authorityBody || '');
        const cleanDisp = cleanAddressString(res.data.displayAddress || '');
        const finalAuthority = {
          ...res.data,
          authorityBody: res.data.authorityBody ? res.data.authorityBody.replace(/,?\s*(?:in\s+)?pune\s+division\b/gi, '').trim() : cleanBody,
          displayAddress: cleanDisp || 'Kolhapur, Maharashtra',
          letterHeader: res.data.letterHeader ? res.data.letterHeader.replace(/,?\s*(?:in\s+)?pune\s+division\b/gi, '') : undefined,
        };
        setAuthorityInfo(finalAuthority);
        setAuthorityOverride(finalAuthority.authorityType);
      }

        // Update Location Detector card with human-readable address
        const displayAddr = cleanAddressString(res.data.displayAddress || clientAddress?.formattedAddress);
        if (displayAddr && displayAddr !== 'Unknown Location') {
          setExifAddress(displayAddr);
          setExifSource('PIN_SELECTED');
          setExifStatus('found');
        }

        // Auto-update formal complaint letter with newly detected authority
        setFormData((prev) => {
          const currentType = prev.problemType || 'Other';
          const newLetter = generateDeterministicLetter({
            templateType: getTemplateType(currentType),
            userName: userData?.name || 'Concerned Citizen',
            locationAddress: displayAddr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            authorityInfo: finalAuthority,
            problemType: currentType,
            detectionCount: detections.length || 1,
            severity: prev.severity || 'Medium',
          });
          setCanonicalEnglishLetter(newLetter);
          return {
            ...prev,
            formalLetter: newLetter,
          };
        });

        Toast.show({
          type: 'success',
          text1: 'Jurisdiction Updated 🏛️',
          text2: finalAuthority.authorityBody || displayAddr,
          visibilityTime: 2500,
        });
      }
    } catch (err) {
      console.warn('Authority detection error:', err);
    } finally {
      setAuthorityLoading(false);
    }
  };

  const handleAuthorityOverride = (newType) => {
    setAuthorityOverride(newType);
    setShowAuthorityPicker(false);

    const selected = AUTHORITY_TYPES.find((a) => a.value === newType);
    if (!selected) return;

    let targetName =
      authorityInfo?.address?.village ||
      authorityInfo?.address?.town ||
      authorityInfo?.address?.suburb ||
      authorityInfo?.address?.city ||
      authorityInfo?.address?.district ||
      'Kolhapur';

    targetName = cleanPlaceName(targetName) || 'Kolhapur';

    let authorityBody = '';
    if (newType === 'municipal_corporation') {
      const knownCorps = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Pimpri-Chinchwad'];
      const matchedCorp = knownCorps.find((c) => c.toLowerCase() === targetName.toLowerCase());
      authorityBody = `Municipal Corporation ${matchedCorp || 'Kolhapur'}`;
    } else if (newType === 'gram_panchayat') {
      const vName = (targetName.toLowerCase() === 'kolhapur' || targetName.toLowerCase() === 'pune')
        ? (authorityInfo?.address?.village || 'Local Village')
        : targetName;
      authorityBody = `Gram Panchayat ${vName}`;
    } else if (newType === 'municipal_council') {
      authorityBody = `Municipal Council ${targetName}`;
    } else {
      authorityBody = `${selected.label} ${targetName}`;
    }

    const updatedInfo = {
      ...(authorityInfo || {}),
      authorityType: newType,
      authorityTitle: selected.title,
      authorityBody,
      confidence: 100,
      detectionMethod: 'manual_override',
      letterHeader: `To,\n${selected.title},\n${authorityBody},\nDistrict Kolhapur, Maharashtra`,
    };
    setAuthorityInfo(updatedInfo);

    const locationAddress =
      updatedInfo.displayAddress ||
      (typeof exifAddress === 'string' ? exifAddress : exifAddress?.fullAddress) ||
      userLoc.address ||
      '';

    setFormData((prev) => {
      const currentType = prev.problemType || 'Other';
      const newLetter = generateDeterministicLetter({
        templateType: getTemplateType(currentType),
        userName: userData?.name || 'Concerned Citizen',
        locationAddress,
        authorityInfo: updatedInfo,
        problemType: currentType,
        detectionCount: detections.length || 1,
        severity: prev.severity || 'Medium',
      });
      setCanonicalEnglishLetter(newLetter);
      return {
        ...prev,
        formalLetter: newLetter,
      };
    });

    Toast.show({
      type: 'success',
      text1: `Authority: ${selected.label}`,
      text2: `Addressed to ${selected.title}`,
      visibilityTime: 2500,
    });
  };

  const handleUpload = async (uploadedFile, url) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setPreview(url);
    setExifStatus('detecting');
    setStep(2);

    try {
      // 1. Reputation Check
      if (userData?.uid) {
        try {
          const repRes = await checkCanSubmit(userData.uid);
          if (!repRes.data.canSubmit) {
            Toast.show({
              type: 'error',
              text1: 'Submission Blocked',
              text2: 'Account restricted due to too many invalid reports.',
            });
            setStep(1);
            return;
          }
        } catch {}
      }

      // 2. EXIF Location Extraction
      let detectedLat = null;
      let detectedLng = null;
      let detectedAddress = null;

      if (uploadedFile.exif?.GPSLatitude && uploadedFile.exif?.GPSLongitude) {
        detectedLat = uploadedFile.exif.GPSLatitude;
        detectedLng = uploadedFile.exif.GPSLongitude;
        setExifStatus('found');
        setExifSource('EXIF_GPS');
        setLocationSource('EXIF_GPS');

        try {
          const geoRes = await reverseGeocodeLocation(detectedLat, detectedLng);
          detectedAddress = geoRes.data;
          setExifAddress(detectedAddress);
        } catch {}
      } else {
        // Try server-side EXIF parse
        let foundServerGps = false;
        try {
          const srvRes = await extractLocationFromImage(uploadedFile);
          if (srvRes.data?.found) {
            detectedLat = srvRes.data.latitude;
            detectedLng = srvRes.data.longitude;
            detectedAddress = srvRes.data.address;
            setExifStatus('found');
            setExifSource(srvRes.data.source);
            setExifAddress(detectedAddress);
            setLocationSource(srvRes.data.source);
            foundServerGps = true;
          }
        } catch {}

        // Fallback to Live Mobile Phone GPS if photo has no embedded GPS
        if (!foundServerGps) {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const livePos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
              detectedLat = livePos.coords.latitude;
              detectedLng = livePos.coords.longitude;
              setLocationSource('BROWSER_GPS');
              setExifSource('BROWSER_GPS');
              setExifStatus('found');
              try {
                const geoRes = await reverseGeocodeLocation(detectedLat, detectedLng);
                detectedAddress = geoRes.data;
                setExifAddress(detectedAddress);
              } catch {}
            } else {
              setExifStatus('not_found');
              setLocationSource('MANUAL');
            }
          } catch {
            setExifStatus('not_found');
            setLocationSource('MANUAL');
          }
        }
      }

      if (detectedLat && detectedLng) {
        const newPos = { latitude: detectedLat, longitude: detectedLng };
        setMarkerPos(newPos);
        setMapRegion({ ...newPos, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        fetchAuthority(detectedLat, detectedLng);
        Toast.show({
          type: 'success',
          text1: 'Location Detected 📍',
          text2: locationSource === 'EXIF_GPS' ? 'Extracted GPS coordinates from image metadata.' : 'Acquired location from phone GPS.',
        });
      }

      // 3. AI Analysis with Local-First Routing & Fallback
      const isStLight = (categoryParam || formData.problemType || '').toLowerCase().includes('light');
      const isRoad = (categoryParam || formData.problemType || '').toLowerCase().includes('pothole') || (categoryParam || '').toLowerCase().includes('road');
      const isGarb = (categoryParam || formData.problemType || '').toLowerCase().includes('garbage') || (categoryParam || '').toLowerCase().includes('waste');

      if (isStLight) {
        setAnalysisStageText('Connecting to Gemini Vision...');
        setAnalysisSubtitleText('Inspecting streetlight pole structure & lamp fixtures');
      } else if (isRoad) {
        setAnalysisStageText('Scanning with Local YOLO11n Model (pothole_best)...');
        setAnalysisSubtitleText('Direct on-server neural inference · zero cloud latency');
      } else if (isGarb) {
        setAnalysisStageText('Scanning with Local YOLO11n Model (garbage_best)...');
        setAnalysisSubtitleText('Direct on-server neural inference · zero cloud latency');
      } else {
        setAnalysisStageText('Scanning with Local YOLO11n Models...');
        setAnalysisSubtitleText('Evaluating road damage & solid waste accumulation');
      }

      const locationAddress = detectedAddress?.fullAddress || (detectedAddress ? `${detectedAddress.city || ''}, ${detectedAddress.state || ''}` : '');
      const userName = userData?.name || '';
      const res = await analyzeImage(uploadedFile, {
        userName,
        locationAddress,
        authorityInfo,
        category: categoryParam || '',
        problemType: formData.problemType || '',
      });
      const data = res.data;

      setAnalysisProvider(data.analysisProvider || 'yolo');
      setGeminiFallback(!!data.geminiFallback);
      setFallbackReason(data.fallbackReason || '');
      setFinalImageUrl(data.imageUrl);
      setImageValidation(data.imageValidation);
      setDetections(data.detections || []);

      // Non-Civic Image Rejection Handling (Section 10 & 16 of handoff)
      if (data.imageValidation && !data.imageValidation.isValid) {
        setRejectionReason(
          data.imageValidation.reason || 'No recognized civic infrastructure issue detected in this photo.'
        );
        setRejectionDetectedContent(data.imageValidation.detectedContent || 'Non-civic subject');
        setShowRejectionModal(true);
        setStep(1);
        return;
      }

      // Automatic Category & Problem Type Selection
      let detectedProblemType = formData.problemType || 'Other';
      if (data.problemType && data.problemType !== 'None' && data.problemType !== 'other') {
        const pt = data.problemType.toLowerCase();
        if (pt.includes('pothole') || pt.includes('road')) detectedProblemType = 'Pothole';
        else if (pt.includes('garbage') || pt.includes('waste')) detectedProblemType = 'Garbage Dump';
        else if (pt.includes('light') || pt.includes('streetlight')) detectedProblemType = 'Streetlight Fault';
        else if (pt.includes('drain') || pt.includes('flood') || pt.includes('sewer')) detectedProblemType = 'Broken Drainage';
        else if (pt.includes('water')) detectedProblemType = 'Water Leakage';
        else if (pt.includes('tree')) detectedProblemType = 'Fallen Tree';
      }

      // Generate Deterministic Legal Letter if not provided
      let letter = data.formalLetter;
      if (!letter || letter.trim().length === 0) {
        letter = generateDeterministicLetter({
          templateType: getTemplateType(detectedProblemType),
          userName,
          locationAddress,
          authorityInfo,
          problemType: detectedProblemType,
          detectionCount: data.detectionCount || (data.detections?.length || 1),
          severity: data.severity || 'Medium',
        });
      }

      setCanonicalEnglishLetter(letter);

      setFormData({
        problemType: detectedProblemType,
        severity: data.severity || 'Medium',
        formalLetter: letter,
        description: data.description || `Reported ${detectedProblemType} issue at ${locationAddress || 'specified location'}`,
        department: data.department || getDepartment(detectedProblemType),
      });

      // 4. Duplicate Check
      try {
        const locPayload = {
          state: detectedAddress?.state || authorityInfo?.address?.state || '',
          district: detectedAddress?.district || authorityInfo?.address?.district || '',
          city: detectedAddress?.city || authorityInfo?.address?.city || '',
          area: detectedAddress?.area || authorityInfo?.address?.area || '',
        };

        const dupeRes = await checkDuplicate(detectedProblemType, data.description || '', locPayload);
        if (dupeRes.data?.embedding) {
          setComplaintEmbedding(dupeRes.data.embedding);
        }

        if (dupeRes.data?.duplicate && dupeRes.data?.similarComplaints?.length > 0) {
          setDuplicateResults(dupeRes.data.similarComplaints);
          setShowDuplicateModal(true);
        }
      } catch (err) {
        console.warn('Duplicate check non-blocking error:', err);
      }

      setStep(3);
    } catch (err) {
      console.error('Analyze error details:', {
        message: err.message,
        code: err.code,
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
      });
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: err.response?.data?.message || err.message || 'Network communication error',
      });
      setStep(1);
    }
  };

  // Manual Override Handler if non-civic image was flagged
  const handleProceedManually = () => {
    setShowRejectionModal(false);
    const locationAddress = authorityInfo?.displayAddress || exifAddress?.fullAddress || userLoc.address || '';
    const userName = userData?.name || 'Concerned Citizen';
    const manualType = formData.problemType || 'Other';
    const fallbackLetter = generateDeterministicLetter({
      templateType: getTemplateType(manualType),
      userName,
      locationAddress,
      authorityInfo,
      problemType: manualType,
      severity: 'Medium',
    });

    setCanonicalEnglishLetter(fallbackLetter);
    setFormData((prev) => ({
      ...prev,
      problemType: manualType,
      formalLetter: fallbackLetter,
      description: prev.description || 'Civic infrastructure defect requiring attention.',
      department: getDepartment(manualType),
    }));
    setStep(3);
    Toast.show({
      type: 'info',
      text1: 'Manual Reporting Active ✏️',
      text2: 'Please verify the category and details before submitting.',
    });
  };

  // Regenerate deterministic formal letter on category or details change
  const handleRegenerateLetter = () => {
    const locationAddress = authorityInfo?.displayAddress || exifAddress?.fullAddress || userLoc.address || '';
    const userName = userData?.name || 'Concerned Citizen';
    const currentType = formData.problemType || 'Other';
    const newLetter = generateDeterministicLetter({
      templateType: getTemplateType(currentType),
      userName,
      locationAddress,
      authorityInfo,
      problemType: currentType,
      detectionCount: detections.length || 1,
      severity: formData.severity,
    });
    setCanonicalEnglishLetter(newLetter);
    setFormData((prev) => ({ ...prev, formalLetter: newLetter }));
    if (selectedLanguage !== 'en') {
      handleTranslate(selectedLanguage, newLetter);
    }
    Toast.show({
      type: 'success',
      text1: 'Template Letter Regenerated 📄',
      text2: `Updated for ${currentType}`,
    });
  };

  const handleTranslate = async (langCode, customSource) => {
    setSelectedLanguage(langCode);
    if (langCode === 'en') {
      setTranslatedLetter('');
      return;
    }
    const sourceText = customSource || canonicalEnglishLetter || formData.formalLetter;
    if (!sourceText) return;

    setTranslating(true);
    try {
      const res = await translateLetter(sourceText, langCode);
      setTranslatedLetter(res.data.translatedText);
      Toast.show({
        type: 'success',
        text1: 'Translation Complete',
        text2: `Complaint letter translated to ${LANGUAGES.find((l) => l.code === langCode)?.name || langCode}`,
      });
    } catch (err) {
      console.warn('Translation failure graceful fallback:', err);
      Toast.show({
        type: 'error',
        text1: 'Translation Unavailable',
        text2: 'Local language translation currently unavailable. English complaint preserved.',
      });
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        imageUrl: finalImageUrl || preview,
        userId: userData?.uid || '',
        userName: userData?.name || 'Anonymous',
        userEmail: userData?.email || '',
        location: {
          lat: markerPos.latitude,
          lng: markerPos.longitude,
          address: authorityInfo?.displayAddress || exifAddress?.fullAddress || userLoc.address || 'User Specified Location',
        },
        state: exifAddress?.state || authorityInfo?.address?.state || '',
        district: exifAddress?.district || authorityInfo?.address?.district || '',
        city: exifAddress?.city || authorityInfo?.address?.city || '',
        area: exifAddress?.area || authorityInfo?.address?.village || '',
        authorityType: authorityOverride || authorityInfo?.authorityType || 'municipal_corporation',
        authorityBody: authorityInfo?.authorityBody || '',
        locationSource,
        translatedLetter: translatedLetter || '',
        translatedLanguage: selectedLanguage !== 'en' ? selectedLanguage : '',
        imageValidation: imageValidation || {},
        userLocation: {
          lat: userLoc.lat || 0,
          lng: userLoc.lng || 0,
        },
        embedding: complaintEmbedding || [],
      };

      const res = await createComplaint(dataToSubmit);
      const newId = res.data?._id || res.data?.id || 'CMP-SUCCESS';
      setSubmittedId(newId);
      setShowDuplicateModal(false);
      setStep(4);
      Toast.show({
        type: 'success',
        text1: 'Complaint Registered! 🎉',
        text2: `Tracking ID: ${newId}`,
      });
    } catch (err) {
      console.error('Submit complaint error:', err);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: err.response?.data?.message || 'Error creating complaint.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 30px; color: #1e293b;">
            <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 24px;">
              <h1 style="color: #059669; margin: 0;">CIVIC ISSUE REPORT</h1>
              <p style="margin: 4px 0; color: #64748b;">Tracking Number: <strong>${submittedId}</strong></p>
            </div>
            <h3>To: ${authorityInfo?.authorityTitle || 'The Municipal Officer'}</h3>
            <p><strong>Body:</strong> ${authorityInfo?.authorityBody || 'Municipal Authority'}</p>
            <p><strong>Category:</strong> ${formData.problemType} (${formData.severity} Priority)</p>
            <p><strong>Location:</strong> ${authorityInfo?.displayAddress || userLoc.address || 'Specified GPS Location'}</p>
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
            <h4>Formal Complaint Letter</h4>
            <div style="white-space: pre-wrap; line-height: 1.6;">${formData.formalLetter || formData.description}</div>
            ${
              translatedLetter
                ? `<hr style="margin: 20px 0;" /><h4>Translated Version (${selectedLanguage.toUpperCase()})</h4><div style="white-space: pre-wrap; line-height: 1.6;">${translatedLetter}</div>`
                : ''
            }
          </body>
        </html>
      `;

      try {
        await Print.printAsync({ html: htmlContent });
      } catch {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        Toast.show({
          type: 'success',
          text1: 'PDF Document Ready',
          text2: `Saved to device: ${uri.split('/').pop()}`,
        });
      }
    } catch (err) {
      console.error('PDF error:', err);
      Alert.alert('Error', 'Failed to generate PDF document.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <CustomHeader title="Report Issue" />

      {/* Stepper Header (Sticky at top with connecting progress line and transitions) */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
          paddingVertical: 14,
          paddingHorizontal: 20,
          width: '100%',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            position: 'relative',
          }}
        >
          {/* Thin Background Progress Track Line */}
          <View
            style={{
              position: 'absolute',
              top: 13,
              left: 24,
              right: 24,
              height: 2,
              backgroundColor: '#E2E8F0',
              zIndex: 0,
            }}
          >
            {/* Animated Active Fill Line */}
            <Animated.View
              style={{
                height: 2,
                backgroundColor: '#059669',
                width: progressAnim.interpolate({
                  inputRange: [1, 2, 3, 4],
                  outputRange: ['0%', '33.3%', '66.6%', '100%'],
                }),
              }}
            />
          </View>

          {/* Step items */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1,
            }}
          >
            {['Upload', 'Analyze', 'Review', 'Finish'].map((sName, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isDone = step > num;

              return (
                <TouchableOpacity
                  key={sName}
                  onPress={() => {
                    if (isDone) setStep(num);
                  }}
                  disabled={!isDone}
                  activeOpacity={0.7}
                  style={{ alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 4 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isDone ? '#059669' : isActive ? '#ECFDF5' : '#FFFFFF',
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isDone ? '#059669' : isActive ? '#059669' : '#CBD5E1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: isActive ? '#059669' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isActive ? 0.3 : 0,
                      shadowRadius: 3,
                      elevation: isActive ? 2 : 0,
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} color="#FFFFFF" />
                    ) : (
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: isActive ? '#059669' : '#94A3B8',
                        }}
                      >
                        {num}
                      </Text>
                    )}
                  </View>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{
                      fontSize: 11,
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? '#059669' : isDone ? '#0F172A' : '#94A3B8',
                      marginTop: 4,
                    }}
                  >
                    {sName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isMapDragging}
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (step === 3) {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 70;
            setChatbotVisible(!isNearBottom);
          }
        }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: step === 3 ? 140 : Math.max(insets.bottom, 24) + 80,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%',
            alignSelf: 'center',
          }}
        >
          {/* STEP 1: Upload */}
          {step === 1 && (
            <View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}
              >
                Snap or Upload Evidence
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}
              >
                Take a clear picture of the civic issue. Our AI extracts location and describes the problem.
              </Text>

              <UploadBox onUpload={handleUpload} initialPreview={preview} detections={detections} />
            </View>
          )}

          {/* STEP 2: Analyzing Loader */}
          {step === 2 && (
            <View style={{ paddingVertical: 60 }}>
              <Loader text={analysisStageText} subtitle={analysisSubtitleText} />
            </View>
          )}

          {/* STEP 3: Review & Edit Form */}
          {step === 3 && (
            <View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 4 }}
              >
                Review Complaint
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}
              >
                Review the AI analysis, verify location, and choose your preferred language.
              </Text>

              {/* Photo Thumbnail with AI Bounding Box Overlays */}
              {preview && (
                <View
                  style={{
                    position: 'relative',
                    height: 190,
                    borderRadius: 18,
                    overflow: 'hidden',
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    backgroundColor: '#0F172A',
                  }}
                >
                  <Image
                    source={{ uri: preview }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                  {detections && detections.length > 0 && detections.map((det, idx) => {
                    const norm = det.normalized || (det.box_2d ? {
                      y1: det.box_2d[0] / 1000,
                      x1: det.box_2d[1] / 1000,
                      y2: det.box_2d[2] / 1000,
                      x2: det.box_2d[3] / 1000,
                    } : null);
                    if (!norm) return null;
                    const left = `${Math.max(0, norm.x1 * 100)}%`;
                    const top = `${Math.max(0, norm.y1 * 100)}%`;
                    const width = `${Math.min(100, (norm.x2 - norm.x1) * 100)}%`;
                    const height = `${Math.min(100, (norm.y2 - norm.y1) * 100)}%`;
                    const confPercent = Math.round((det.confidence || 0.85) * 100);

                    return (
                      <View
                        key={idx}
                        style={{
                          position: 'absolute',
                          left,
                          top,
                          width,
                          height,
                          borderWidth: 2,
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          borderRadius: 4,
                        }}
                      >
                        <View
                          style={{
                            position: 'absolute',
                            top: -20,
                            left: 0,
                            backgroundColor: '#059669',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                            {det.label || 'Defect'} {confPercent}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* AI Analysis Provider & Model Verification Badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor:
                    analysisProvider === 'yolo'
                      ? '#ECFDF5'
                      : geminiFallback
                      ? '#FFFBEB'
                      : '#EFF6FF',
                  borderWidth: 1,
                  borderColor:
                    analysisProvider === 'yolo'
                      ? '#A7F3D0'
                      : geminiFallback
                      ? '#FDE68A'
                      : '#BFDBFE',
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  gap: 10,
                }}
              >
                {analysisProvider === 'yolo' ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : geminiFallback ? (
                  <Sparkles size={18} color="#D97706" />
                ) : (
                  <Lightbulb size={18} color="#2563EB" />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{
                      fontSize: 12.5,
                      fontWeight: '800',
                      color:
                        analysisProvider === 'yolo'
                          ? '#065F46'
                          : geminiFallback
                          ? '#92400E'
                          : '#1E40AF',
                    }}
                  >
                    {analysisProvider === 'yolo'
                      ? 'Verified by Local YOLO11n Model · Gemini Skipped'
                      : geminiFallback
                      ? `Verified via Gemini Vision Fallback (${fallbackReason || 'uncertain'})`
                      : 'Inspected via Gemini Vision (Streetlight Physical Defect Inspection)'}
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={{
                      fontSize: 11,
                      color:
                        analysisProvider === 'yolo'
                          ? '#047857'
                          : geminiFallback
                          ? '#B45309'
                          : '#3B82F6',
                      marginTop: 1,
                    }}
                  >
                    {analysisProvider === 'yolo'
                      ? 'Direct neural weights inference with deterministic complaint template'
                      : geminiFallback
                      ? 'Local model uncertain or unavailable · verified via cloud vision fallback'
                      : 'Physical structural defect inspection without unverified electrical assumptions'}
                  </Text>
                </View>
              </View>

              {/* Location Status Detector */}
              <LocationDetector
                status={exifStatus}
                source={exifSource}
                address={exifAddress}
                onManualSelect={() => {}}
              />

              {/* Interactive OpenStreetMap via LeafletMap */}
              <View
                onTouchStart={() => setIsMapDragging(true)}
                style={{
                  height: 200,
                  borderRadius: 18,
                  overflow: 'hidden',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  position: 'relative',
                }}
              >
                <LeafletMap
                  latitude={markerPos.latitude}
                  longitude={markerPos.longitude}
                  draggable={true}
                  height={200}
                  borderRadius={18}
                  onInteractionChange={setIsMapDragging}
                  onLocationSelect={(newCoord) => {
                    setMarkerPos(newCoord);
                    setLocationSource('MANUAL');
                    fetchAuthority(newCoord.latitude, newCoord.longitude);
                  }}
                />

                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                    Drag pin or tap map to refine
                  </Text>
                </View>
              </View>

              {/* Responsible Authority Card & Jurisdiction Selector */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  marginBottom: 16,
                  shadowColor: '#0F172A',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Building2 size={18} color="#059669" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', textTransform: 'uppercase' }}
                  >
                    Target Authority Body
                  </Text>
                </View>

                {authorityLoading ? (
                  <ActivityIndicator color="#059669" size="small" style={{ marginVertical: 8 }} />
                ) : (
                  <View>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 15, fontWeight: '800', color: '#059669', marginBottom: 2 }}
                    >
                      {authorityInfo?.authorityBody || 'Detecting Authority...'}
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 12, color: '#64748B' }}
                    >
                      Title: {authorityInfo?.authorityTitle || 'The Competent Authority'}
                    </Text>
                    {authorityInfo?.displayAddress && authorityInfo.displayAddress !== 'Unknown Location' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <MapPin size={12} color="#059669" />
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 11, color: '#047857', fontWeight: '600', flex: 1 }}
                        >
                          {authorityInfo.displayAddress}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Override Dropdown Toggle */}
                <TouchableOpacity
                  onPress={() => setShowAuthorityPicker(!showAuthorityPicker)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#059669', fontWeight: '700' }}>
                    Change jurisdiction type
                  </Text>
                  {showAuthorityPicker ? (
                    <ChevronUp size={16} color="#059669" />
                  ) : (
                    <ChevronDown size={16} color="#059669" />
                  )}
                </TouchableOpacity>

                {/* Jurisdiction Options with Lucide Icons and Selected States */}
                {showAuthorityPicker && (
                  <View style={{ gap: 8, marginTop: 12 }}>
                    {AUTHORITY_TYPES.map((auth) => {
                      const isSelected = (authorityOverride || authorityInfo?.authorityType) === auth.value;
                      const IconComp = auth.iconKey === 'Home' ? Home : auth.iconKey === 'Building2' ? Building2 : Landmark;
                      return (
                        <TouchableOpacity
                          key={auth.value}
                          onPress={() => {
                            handleAuthorityOverride(auth.value);
                          }}
                          activeOpacity={0.7}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? '#059669' : '#E2E8F0',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <View
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: auth.badgeBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <IconComp size={20} color={auth.badgeColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{
                                  fontSize: 14,
                                  fontWeight: isSelected ? '800' : '700',
                                  color: '#0F172A',
                                }}
                              >
                                {auth.label}
                              </Text>
                              <Text
                                maxFontSizeMultiplier={1.3}
                                style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}
                              >
                                {auth.title} • {auth.desc}
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <CheckCircle2 size={20} color="#059669" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Problem Type Selector */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, paddingHorizontal: 2 }}
                >
                  Issue Category <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <HorizontalChipSelector
                  items={PROBLEM_TYPES}
                  selected={formData.problemType}
                  onSelect={(p) => {
                    const dept = getDepartment(p);
                    const locationAddress = authorityInfo?.displayAddress || exifAddress?.fullAddress || userLoc.address || '';
                    const userName = userData?.name || 'Concerned Citizen';
                    const newLetter = generateDeterministicLetter({
                      templateType: getTemplateType(p),
                      userName,
                      locationAddress,
                      authorityInfo,
                      problemType: p,
                      detectionCount: detections.length || 1,
                      severity: formData.severity,
                    });
                    setCanonicalEnglishLetter(newLetter);
                    setFormData((prev) => ({ ...prev, problemType: p, department: dept, formalLetter: newLetter }));
                    if (selectedLanguage !== 'en') {
                      handleTranslate(selectedLanguage, newLetter);
                    }
                  }}
                  activeColor="#059669"
                  fadeColor="#FFFFFF"
                  contentPaddingHorizontal={2}
                />
              </View>

              {/* Daytime Streetlight Physical Inspection Notice */}
              {formData.problemType === 'Streetlight Fault' && (
                <View
                  style={{
                    backgroundColor: '#FFFBEB',
                    borderWidth: 1,
                    borderColor: '#FDE68A',
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 16,
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <Lightbulb size={18} color="#D97706" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 13, fontWeight: '800', color: '#92400E', marginBottom: 2 }}
                    >
                      Daytime Physical Inspection Note
                    </Text>
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 12, color: '#B45309', lineHeight: 17 }}
                    >
                      For daylight reports, municipal field inspectors require physical damage indicators (shattered fixture, exposed wiring, damaged pole base) as illumination cannot be verified during daytime.
                    </Text>
                  </View>
                </View>
              )}

              {/* Severity Selector with Semantic Colors (filled only when selected) */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 }}
                >
                  Severity Priority
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {SEVERITIES.map((sev) => {
                    const isSelected = formData.severity === sev.key;
                    return (
                      <TouchableOpacity
                        key={sev.key}
                        onPress={() => setFormData({ ...formData, severity: sev.key })}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          paddingHorizontal: 4,
                          borderRadius: 14,
                          backgroundColor: isSelected ? sev.color : sev.bgUnselected,
                          borderWidth: 1.5,
                          borderColor: sev.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: isSelected ? sev.color : 'transparent',
                          shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                          shadowOpacity: isSelected ? 0.3 : 0,
                          shadowRadius: 4,
                          elevation: isSelected ? 2 : 0,
                        }}
                      >
                        <Text
                          maxFontSizeMultiplier={1.2}
                          style={{
                            fontSize: 13,
                            fontWeight: '800',
                            color: isSelected ? '#FFFFFF' : sev.color,
                          }}
                        >
                          {sev.key}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Language Selector (uses brand emerald #059669) */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, paddingHorizontal: 2 }}>
                  <Globe size={16} color="#059669" />
                  <Text
                    maxFontSizeMultiplier={1.3}
                    style={{ fontSize: 13, fontWeight: '700', color: '#334155' }}
                  >
                    Complaint Letter Language (13 Indian Languages)
                  </Text>
                </View>
                <HorizontalChipSelector
                  items={LANGUAGES}
                  selected={selectedLanguage}
                  onSelect={(lang) => handleTranslate(lang.code)}
                  getKey={(item) => item.code}
                  getLabel={(item) => item.nativeName}
                  activeColor="#059669"
                  fadeColor="#FFFFFF"
                  contentPaddingHorizontal={2}
                />
              </View>

              {/* Editable Complaint Letter Box */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  marginBottom: 20,
                  shadowColor: '#0F172A',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="#059669" />
                    <Text
                      maxFontSizeMultiplier={1.3}
                      style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}
                    >
                      Official Complaint Draft
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {translating && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ActivityIndicator size="small" color="#059669" />
                        <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600' }}>Translating...</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={handleRegenerateLetter}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: '#F8FAFC',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <RefreshCw size={11} color="#64748B" />
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}
                      >
                        Reset
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        backgroundColor: '#ECFDF5',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#A7F3D0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Pencil size={11} color="#059669" />
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={{ fontSize: 10, fontWeight: '700', color: '#059669' }}
                      >
                        Tap to Edit
                      </Text>
                    </View>
                  </View>
                </View>

                <TextInput
                  multiline
                  value={translatedLetter || formData.formalLetter}
                  onChangeText={(val) => {
                    if (translatedLetter) setTranslatedLetter(val);
                    else setFormData({ ...formData, formalLetter: val });
                  }}
                  onContentSizeChange={(e) => {
                    const newH = Math.max(140, e.nativeEvent.contentSize.height + 24);
                    setLetterInputHeight(newH);
                  }}
                  placeholder="Write or edit the official complaint letter..."
                  placeholderTextColor="#94A3B8"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    lineHeight: 20,
                    color: '#1E293B',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    textAlignVertical: 'top',
                    minHeight: 140,
                    height: letterInputHeight,
                  }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>
                    {((translatedLetter || formData.formalLetter) || '').length} characters
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 2,
                  borderColor: '#A7F3D0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <CheckCircle2 size={40} color="#059669" />
              </View>

              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 4 }}
              >
                Complaint Registered!
              </Text>
              <Text
                maxFontSizeMultiplier={1.3}
                style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 }}
              >
                Your issue has been routed to the municipal authority with full evidence.
              </Text>

              {/* Tracking ID Badge */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  width: '100%',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 12, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}
                >
                  Tracking Reference Number
                </Text>
                <Text
                  maxFontSizeMultiplier={1.3}
                  style={{ fontSize: 20, fontWeight: '900', color: '#059669', marginVertical: 4 }}
                >
                  {submittedId}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(submittedId, 'Tracking ID copied!')}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                >
                  <Copy size={14} color="#059669" />
                  <Text style={{ fontSize: 12, color: '#059669', fontWeight: '700' }}>
                    Copy Reference ID
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={{ width: '100%', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleExportPDF}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#059669',
                    borderWidth: 1.5,
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Share2 size={18} color="#059669" />
                  <Text style={{ color: '#059669', fontWeight: '800', fontSize: 15 }}>
                    Share / Export Official PDF
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Details', { id: submittedId })}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: '#059669',
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                    View Complaint Status
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setStep(1);
                    setFile(null);
                    setPreview(null);
                  }}
                  activeOpacity={0.7}
                  style={{ paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 14 }}>
                    Submit Another Complaint
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Sticky Bottom Action Bar for Step 3 Review */}
      {step === 3 && !isKeyboardVisible && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 14),
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 90,
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: isTablet ? TABLET_MAX_WIDTH : '100%' }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#059669',
                paddingVertical: 15,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16 }}>
                    Submit Official Complaint
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Duplicate Warning Modal */}
      <DuplicateModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        similarComplaints={duplicateResults}
        onSubmitAnyway={() => {
          setShowDuplicateModal(false);
          setStep(3);
        }}
        isSubmitting={isSubmitting}
      />

      {/* Non-Civic Rejection Modal with Manual Reporting Override */}
      <Modal
        visible={showRejectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            {/* Warning Badge */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FEF2F2',
                borderWidth: 1.5,
                borderColor: '#FCA5A5',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={32} color="#DC2626" />
            </View>

            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 18,
                fontWeight: '900',
                color: '#0F172A',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              No Civic Issue Detected
            </Text>

            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                fontSize: 14,
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 14,
              }}
            >
              {rejectionReason || 'Our automated scan could not identify a public road, garbage, streetlight, or civic maintenance issue in this photo.'}
            </Text>

            {rejectionDetectedContent ? (
              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  marginBottom: 20,
                  width: '100%',
                }}
              >
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}
                >
                  <Text style={{ fontWeight: '700' }}>Detected content: </Text>
                  {rejectionDetectedContent}
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 10 }} />
            )}

            {/* Actions */}
            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowRejectionModal(false);
                  setFile(null);
                  setPreview(null);
                  setStep(1);
                }}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#059669',
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Camera size={18} color="#FFFFFF" />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}
                >
                  Retake Evidence Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleProceedManually}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={{ color: '#334155', fontWeight: '700', fontSize: 14 }}
                >
                  Report Manually Anyway
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubmitScreen;
