CREATE EXTENSION postgis;

CREATE TABLE soil_data (
    ogc_fid integer NOT NULL,
    wkb_geometry geometry(Point,4326),
    pit_location integer,
    depth integer,
    texture character varying,
    pedality character varying
);


--
-- Name: soil_data_ogc_fid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE soil_data_ogc_fid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: soil_data_ogc_fid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE soil_data_ogc_fid_seq OWNED BY soil_data.ogc_fid;


--
-- Name: ogc_fid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY soil_data ALTER COLUMN ogc_fid SET DEFAULT nextval('soil_data_ogc_fid_seq'::regclass);
