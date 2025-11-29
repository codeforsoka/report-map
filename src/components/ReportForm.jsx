import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import ExifReader from 'exifreader';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leafletのデフォルトマーカーアイコン修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 地図の中心を更新するコンポーネント
function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function ReportForm() {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [locationSource, setLocationSource] = useState(''); // 位置情報の取得元を追跡

  useEffect(() => {
    setPosition({ lat: 35.8255, lng: 139.8227 });
  }, []);

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationSource('GPS');
        },
        (error) => {
          console.error('GPS取得エラー:', error);
          alert('位置情報の取得に失敗しました');
        }
      );
    } else {
      alert('このブラウザは位置情報に対応していません');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const tags = await ExifReader.load(file);

      if (tags.GPSLatitude && tags.GPSLongitude) {
        const lat = tags.GPSLatitude.description;
        const lng = tags.GPSLongitude.description;
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setLocationSource('画像EXIF');
      } else {
        setLocationSource('');
      }
    } catch (error) {
      console.error('EXIF読み取りエラー:', error);
      setLocationSource('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !position) {
      alert('説明文と位置情報は必須です');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert([
          {
            description,
            image_url: imageUrl,
            latitude: position.lat,
            longitude: position.lng,
          },
        ]);

      if (insertError) throw insertError;

      setSubmitStatus('success');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      setLocationSource('');
      setPosition({ lat: 35.8255, lng: 139.8227 });

      e.target.reset();

    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: 'var(--spacing-xl) var(--spacing-lg)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-2xl)' }}>
          報告フォーム
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-base)'
        }}>
          道路の損傷、建物の異常、災害の様子などを報告してください。
        </p>

        {submitStatus === 'success' && (
          <div style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            backgroundColor: '#E7F6EC',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--color-success)',
            fontWeight: 700
          }}>
            報告を受け付けました。ご協力ありがとうございます。
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            backgroundColor: '#FCE8E6',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--color-error)',
            fontWeight: 700
          }}>
            エラーが発生しました。もう一度お試しください。
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label htmlFor="description">
              説明 <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                fontSize: 'var(--font-size-base)',
                resize: 'vertical'
              }}
              placeholder="例：歩道に大きな穴が開いています"
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label htmlFor="image">画像</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-base)'
              }}
            />
            <small style={{ display: 'block', marginTop: 'var(--spacing-xs)' }}>
              画像にGPS情報が含まれている場合、自動的に位置情報を取得します
            </small>
            {imagePreview && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--color-border)'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label>
              位置情報 <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>

            {position && (
              <div style={{
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--border-radius)',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)'
              }}>
                <div>
                  <strong>緯度:</strong> {position.lat.toFixed(6)}, <strong>経度:</strong> {position.lng.toFixed(6)}
                  {locationSource && (
                    <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
                      ({locationSource}から取得)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={getCurrentPosition}
                  style={{
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface)';
                  }}
                >
                  現在地を取得
                </button>
              </div>
            )}

            <small style={{ display: 'block', marginBottom: 'var(--spacing-md)' }}>
              地図をクリックして位置を調整できます
            </small>
            {position && (
              <div style={{
                height: '400px',
                width: '100%',
                borderRadius: 'var(--border-radius)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)'
              }}>
                <MapContainer
                  center={[position.lat, position.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapCenterUpdater center={position} />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: 'var(--spacing-md) var(--spacing-xl)',
              backgroundColor: isSubmitting ? 'var(--color-border)' : 'var(--color-primary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 700,
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = 'var(--color-primary-dark)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = 'var(--color-primary)';
              }
            }}
          >
            {isSubmitting ? '送信中...' : '報告を送信'}
          </button>
        </form>
      </div>
    </div>
  );
}
