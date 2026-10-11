# Technical Glossary: Amrita Yukti

A quick reference glossary defining technical, cryptographic, geometric, and domain terms used throughout **Amrita Yukti**.

---

### **`btree_gist`**
A PostgreSQL extension that allows B-tree indexing on standard scalar data types within Generalized Search Tree (GiST) indexes. Required to define the `EXCLUDE USING gist` exclusion constraint across scalar resource IDs and timestamp ranges.

### **Exclusion Constraint (`EXCLUDE USING gist`)**
A database-level integrity rule in PostgreSQL guaranteeing that if any two rows are compared on specified columns using specified operators, at least one of these operator comparisons will return false. In Amrita Yukti, it enforces that no two active bookings for the same machine can have overlapping timestamp ranges (`tstzrange(start_ts, end_ts) WITH &&`), preventing race-condition double bookings.

### **Row Level Security (RLS)**
A security feature in PostgreSQL that restricts which rows in a table can be returned or modified by specific users based on SQL policies evaluated against `auth.uid()`.

### **JSON Web Token (JWT)**
A cryptographically signed, stateless authentication token issued by Supabase Auth containing user claims (`sub`, `email`, `role`, `exp`). Passed in the HTTP `Authorization: Bearer <token>` header to authenticate API calls.

### **Signed Tetrahedra Math**
A geometric algorithm for computing the volume of a 3D closed triangle mesh (STL). For each triangle facet with vertices $\vec{v}_1, \vec{v}_2, \vec{v}_3$, the signed volume of the tetrahedron connecting the facet to the coordinate origin is calculated via the scalar triple product: $\frac{1}{6} (\vec{v}_1 \times \vec{v}_2) \cdot \vec{v}_3$. Summing across all facets yields the exact solid volume without voxelization or heavy slicer software.

### **STL (Stereolithography) Format**
A standard file format for 3D printing describing surface geometry as raw, unstructured triangulated surfaces. Supported in both binary and ASCII representations.

### **Gerber Format (`.zip`)**
The standard vector format used by PCB Computer-Aided Manufacturing (CAM) tools to define copper layers, solder masks, legend, and drill holes. Typically bundled as a ZIP archive of individual layer files (`.gtl`, `.gbl`, etc.).

### **Magic Bytes**
The initial sequence of bytes in a file header that uniquely identifies the file format regardless of file extension. Used in Amrita Yukti to verify binary STL headers and ZIP file signatures.

### **Indian Standard Time (IST)**
The time zone observed in India (`UTC+05:30`), with a fixed offset of +330 minutes. All campus business hours (08:30–17:30) and calendar views in Amrita Yukti are computed in IST.

### **Lazy Evaluation**
An evaluation strategy that delays computation until a value is needed. Used in Amrita Yukti for auto-releasing no-show bookings (`autoReleaseNoShows()`) during live requests, eliminating the need for a memory-intensive background cron process.

### **Fuse.js**
A lightweight, zero-dependency client-side fuzzy-search library that calculates weighted Bitap string similarity, powering sub-millisecond component lookups in the hardware inventory view.

### **Helmet**
An Express middleware that sets security-focused HTTP response headers, including Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and X-Content-Type-Options protection.

### **Zod**
A TypeScript/JavaScript-first schema declaration and runtime data validation library used to sanitize and validate incoming request payloads and CSV upload rows.

### **Web Speech API**
Browser-native JavaScript APIs providing speech recognition (`webkitSpeechRecognition`) and speech synthesis (`window.speechSynthesis`), enabling hands-free voice interactions in Amrita Yukti.
