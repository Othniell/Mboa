import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./dashboard.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const mainSections = [
  { key: "hotel", title: "Hotel" },
  { key: "restaurant", title: "Restaurant" },
  { key: "activity", title: "Activity" },
  { key: "profile", title: "User Profile" },
];

// Default sub-boxes per section
const defaultSubBoxesMap = {
  hotel: ["Rooms", "Pool", "Gym", "Location", "Documents", "Description", "Pricing"],
  restaurant: ["Menu", "Seating", "Kitchen", "Location", "Documents", "Description", "Pricing"],
  activity: ["Details", "Photos", "Location", "Documents", "Description", "Pricing"],
};

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("hotel");
  // Keep subBoxes as a state now, so we can add dynamically
  const [subBoxesMap, setSubBoxesMap] = useState({ ...defaultSubBoxesMap });
  const [activeSubBox, setActiveSubBox] = useState(subBoxesMap["hotel"][0]);
  const [data, setData] = useState({});
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    profilePic: "",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("businessData");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    const savedProfile = localStorage.getItem("profileData");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("businessData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("profileData", JSON.stringify(profileData));
  }, [profileData]);

  // When activeSection changes, update activeSubBox accordingly
  useEffect(() => {
    setActiveSubBox(subBoxesMap[activeSection]?.[0] || null);
  }, [activeSection, subBoxesMap]);

  // Image upload handler
  const handleImageUpload = (section, subBoxKey, files) => {
    const newImages = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setData((prev) => {
            const sectionData = prev[section] || {};
            const subBoxData = sectionData[subBoxKey] || { images: [], text: "" };
            return {
              ...prev,
              [section]: {
                ...sectionData,
                [subBoxKey]: {
                  ...subBoxData,
                  images: [...subBoxData.images, ...newImages],
                },
              },
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (section, subBoxKey, idx) => {
    setData((prev) => {
      const sectionData = prev[section] || {};
      const subBoxData = sectionData[subBoxKey] || { images: [], text: "" };
      const newImages = subBoxData.images.filter((_, i) => i !== idx);

      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subBoxKey]: {
            ...subBoxData,
            images: newImages,
          },
        },
      };
    });
  };

  const handleTextChange = (section, subBoxKey, text) => {
    setData((prev) => {
      const sectionData = prev[section] || {};
      const subBoxData = sectionData[subBoxKey] || { images: [], text: "" };
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subBoxKey]: {
            ...subBoxData,
            text,
          },
        },
      };
    });
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleProfileChange("profilePic", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLocationChange = (latlng) => {
    setData((prev) => {
      const sectionData = prev[activeSection] || {};
      return {
        ...prev,
        [activeSection]: {
          ...sectionData,
          Location: {
            ...sectionData.Location,
            coords: latlng,
          },
        },
      };
    });
  };

  const subBoxes = activeSection !== "profile" ? subBoxesMap[activeSection] || [] : [];

  // Add new sub-box name
  const [newSubBoxName, setNewSubBoxName] = useState("");

  // Add new sub-box handler
  const addNewSubBox = () => {
    if (!newSubBoxName.trim()) return alert("Sub-box name cannot be empty");
    if (subBoxes.includes(newSubBoxName.trim())) {
      return alert("Sub-box already exists");
    }

    setSubBoxesMap((prev) => {
      const updatedSubBoxes = {
        ...prev,
        [activeSection]: [...(prev[activeSection] || []), newSubBoxName.trim()],
      };
      return updatedSubBoxes;
    });
    setNewSubBoxName("");
  };

  // Submit all handler (you can replace the alert with real submission logic)
 const handleSubmitAll = async () => {
  const submissionPayload = {
    profile: profileData,
    businessData: data,
    category: activeSection, // ✅ include the category
  };

  try {
    const res = await fetch("http://localhost:5000/api/businesses/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionPayload),
    });

    const responseData = await res.json();

    if (res.ok) {
      alert("Data successfully submitted! 🎉");
      console.log("Server response:", responseData);

      // Optional cleanup after successful submission
      localStorage.removeItem("businessData");
      localStorage.removeItem("profileData");
      setData({});
      setProfileData({ name: "", phone: "", profilePic: "" });
    } else {
      console.error("Submission failed:", responseData);
      alert(`Submission failed: ${responseData.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Network error. Please try again later.");
  }
};


  return (
    <div className="dashboard-container">
      <aside className="side-menu">
        <h2>Business</h2>
        <ul>
          {mainSections.map((section) => (
            <li
              key={section.key}
              className={activeSection === section.key ? "active" : ""}
              onClick={() => setActiveSection(section.key)}
            >
              {section.title}
            </li>
          ))}
        </ul>
      </aside>

      <main className="content-area">
        <h1>{mainSections.find((s) => s.key === activeSection)?.title}</h1>

        {activeSection === "profile" ? (
          <div className="profile-form">
            <label>
              Name:
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleProfileChange("name", e.target.value)}
              />
            </label>
            <label>
              Phone:
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
              />
            </label>
            <label>
              Profile Picture:
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} />
            </label>
            {profileData.profilePic && (
              <img
                src={profileData.profilePic}
                alt="Profile"
                className="profile-pic-preview"
              />
            )}
          </div>
        ) : (
          <>
            {/* Sub-boxes grid with 4 columns */}
            <div className="subboxes-grid-4cols">
              {subBoxes.map((box) => (
                <div
                  key={box}
                  className={`subbox-grid-item ${activeSubBox === box ? "active" : ""}`}
                  onClick={() => setActiveSubBox(box)}
                >
                  <div className="subbox-label">{box}</div>
                  <div className="plus-sign">+</div>
                </div>
              ))}
            </div>

            {/* Add new sub-box input + button */}
            <div style={{ margin: "10px 0", display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="New sub-box name"
                value={newSubBoxName}
                onChange={(e) => setNewSubBoxName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addNewSubBox();
                }}
                style={{ flexGrow: 1, padding: "8px" }}
              />
              <button onClick={addNewSubBox} style={{ padding: "8px 15px" }}>
                Add Sub-box
              </button>
            </div>

            {/* Sub-box content */}
            <div className="subbox-content">
              <h3>{activeSubBox}</h3>

              {activeSubBox === "Location" ? (
                <div style={{ height: "400px", width: "100%" }}>
                  <MapContainer
                    center={
                      data[activeSection]?.Location?.coords || { lat: 4.05, lng: 9.7 }
                    }
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker
                      position={data[activeSection]?.Location?.coords || null}
                      setPosition={handleLocationChange}
                    />
                  </MapContainer>

                  {data[activeSection]?.Location?.coords && (
                    <p>
                      Selected Position:{" "}
                      {`Lat: ${data[activeSection].Location.coords.lat.toFixed(
                        4
                      )}, Lng: ${data[activeSection].Location.coords.lng.toFixed(4)}`}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Text Area */}
                  <textarea
                    rows={5}
                    value={
                      data[activeSection]?.[activeSubBox]?.text || ""
                    }
                    onChange={(e) =>
                      handleTextChange(activeSection, activeSubBox, e.target.value)
                    }
                    placeholder={`Enter text for ${activeSubBox}`}
                  />

                  {/* Image Upload */}
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleImageUpload(activeSection, activeSubBox, e.target.files)
                      }
                    />
                  </div>

                  {/* Image previews */}
                  <div className="image-preview-grid">
                    {(data[activeSection]?.[activeSubBox]?.images || []).map(
                      (img, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={img} alt={`Upload ${idx + 1}`} />
                          <button
                            onClick={() => removeImage(activeSection, activeSubBox, idx)}
                            className="remove-img-btn"
                          >
                            &times;
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Submit All button */}
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={handleSubmitAll}
            style={{
              padding: "10px 25px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Submit All for Review
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
