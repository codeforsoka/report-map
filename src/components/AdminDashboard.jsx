import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('報告取得エラー:', error);
      alert('報告の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    const headers = ['ID', '説明', '緯度', '経度', '画像URL', '報告日時'];
    const rows = reports.map(report => [
      report.id,
      `"${report.description.replace(/"/g, '""')}"`,
      report.latitude,
      report.longitude,
      report.image_url || '',
      new Date(report.created_at).toLocaleString('ja-JP')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
        fontSize: 'var(--font-size-lg)',
        color: 'var(--color-text-secondary)'
      }}>
        読み込み中...
      </div>
    );
  }

  const center = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [35.8255, 139.8227];

  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)'
        }}>
          <div>
            <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>管理画面</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              margin: 0,
              fontSize: 'var(--font-size-base)'
            }}>
              報告件数: {reports.length}件
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              backgroundColor: 'var(--color-success)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            📥 CSVエクスポート
          </button>
        </div>

        {reports.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--spacing-2xl)',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>
              報告がまだありません
            </p>
          </div>
        ) : (
          <>
            <div style={{
              height: '500px',
              width: '100%',
              marginBottom: 'var(--spacing-xl)',
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {reports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    eventHandlers={{
                      click: () => setSelectedReport(report),
                    }}
                  >
                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <strong>{report.description}</strong>
                        <br />
                        <small>{new Date(report.created_at).toLocaleString('ja-JP')}</small>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--spacing-lg)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>報告一覧</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'var(--color-background)',
                      borderBottom: '2px solid var(--color-border)'
                    }}>
                      <th style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--color-text)'
                      }}>
                        報告日時
                      </th>
                      <th style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--color-text)'
                      }}>
                        説明
                      </th>
                      <th style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--color-text)'
                      }}>
                        位置
                      </th>
                      <th style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--color-text)'
                      }}>
                        画像
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        style={{
                          backgroundColor: selectedReport?.id === report.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--color-border)',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setSelectedReport(report)}
                        onMouseEnter={(e) => {
                          if (selectedReport?.id !== report.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-background)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedReport?.id !== report.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                          }
                        }}
                      >
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {new Date(report.created_at).toLocaleString('ja-JP')}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {report.description}
                        </td>
                        <td style={{
                          padding: 'var(--spacing-md)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)'
                        }}>
                          {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {report.image_url ? (
                            <a
                              href={report.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                color: 'var(--color-primary)',
                                textDecoration: 'underline'
                              }}
                            >
                              表示
                            </a>
                          ) : (
                            <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReport && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: 'var(--spacing-lg)'
                }}
                onClick={() => setSelectedReport(null)}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--border-radius)',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>報告詳細</h3>
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      報告日時
                    </strong>
                    <p style={{ margin: 'var(--spacing-xs) 0 0 0' }}>
                      {new Date(selectedReport.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      説明
                    </strong>
                    <p style={{ margin: 'var(--spacing-xs) 0 0 0' }}>
                      {selectedReport.description}
                    </p>
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <strong style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      位置
                    </strong>
                    <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                      緯度: {selectedReport.latitude.toFixed(6)}, 経度: {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                  {selectedReport.image_url && (
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <strong style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        画像
                      </strong>
                      <div style={{ marginTop: 'var(--spacing-sm)' }}>
                        <img
                          src={selectedReport.image_url}
                          alt="報告画像"
                          style={{
                            maxWidth: '100%',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--color-border)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 700,
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--color-background)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--color-surface)';
                    }}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
