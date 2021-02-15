#version 330

uniform mat4 m_pvm, m_view;
uniform mat3 m_normal;
uniform vec4 l_dir;    //world 
uniform sampler2D noise;
uniform float maxHeight, noiseVariance, noiseScale, waterHeight, octaves, H, lacunarity, time;
uniform int noiseVersion;

float pi = 3.1415926;

in vec4 position;    //local
in vec3 normal;        //local
in vec2 texCoord0;    //local

out vec4 pos;
out vec3 n,  lDir; //camera
out vec2 tc;


vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;}

vec4 permute(vec4 x) {return mod289(((x*34.0)+1.0)*x);}

vec4 taylorInvSqrt(vec4 r) {return 1.79284291400159 - 0.85373472095314 * r;}


float snoise(vec3 v) { 
	const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
	const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
	// First corner
	vec3 i  = floor(v + dot(v, C.yyy) );
	vec3 x0 =   v - i + dot(i, C.xxx) ;

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );

	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;

	// Permutations
	i = mod289(i); 
	vec4 p = permute( permute( permute( 
	           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
	         + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
	         + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

	// Gradients: 7x7 points over a square, mapped onto an octahedron.
	// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
	float n_ = 0.142857142857;
	vec3  ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_ );

	vec4 x = x_ *ns.x + ns.yyyy;
	vec4 y = y_ *ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );

	vec4 s0 = floor(b0)*2.0 + 1.0;
	vec4 s1 = floor(b1)*2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
	vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

	vec3 p0 = vec3(a0.xy,h.x);
	vec3 p1 = vec3(a0.zw,h.y);
	vec3 p2 = vec3(a1.xy,h.z);
	vec3 p3 = vec3(a1.zw,h.w);

	//Normalise gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}



/*
* Procedural fBm evaluated at "point"; returns value stored in "value".
*
* Copyright 1994 F. Kenton Musgrave 
* 
* Parameters:
*    ``H''  is the fractal increment parameter
*    ``lacunarity''  is the gap between successive frequencies
*    ``octaves''  is the number of frequencies in the fBm
*/

float fbm(vec3 point, float H, float lacunarity, float octaves){
  	float value, frequency, rem;
  	bool first = true; //static
	float exponent_array[8+1]; //static
    /*precompute and store spectral weights */
    if (first){
        /* seize required memory for exponent_array */
        frequency = 1.0;
        for (int i = 0; i <= octaves; i++){
            /* compute weight for each frequency */
            exponent_array[i] = pow(frequency, -H);
            frequency *= lacunarity;
        }
    first = false;
	}

    value = 0.0;            /* initialize vars to proper values */
    frequency = 1;

    /* inner loop of spectral construction */
    int i;
    for (i = 0; i < octaves; i++){
        value += snoise(point) * exponent_array[i];
        point.x *= lacunarity;
        point.z *= lacunarity;
    }

	rem = octaves - floor(octaves);
    if (rem > 0)
        value += rem * snoise(point) * exponent_array[i];

    return (value);
}

float fbmSmoother( vec2 p, float H, float lacunarity, float octaves){

    float h0= fbm(vec3((p.x)/noiseScale,0.0,p.y/noiseScale),H,lacunarity,octaves) * maxHeight;
    
    float h1= fbm(vec3((p.x+1)/noiseScale,0.0,p.y/noiseScale),H,lacunarity,octaves) * maxHeight;
    float h2= fbm(vec3((p.x+1)/noiseScale,0.0,p.y/noiseScale),H,lacunarity,octaves) * maxHeight;
    float h3= fbm(vec3((p.x)/noiseScale,0.0,(p.y+1)/noiseScale),H,lacunarity,octaves) * maxHeight;
    float h4= fbm(vec3((p.x)/noiseScale,0.0,(p.y-1)/noiseScale),H,lacunarity,octaves) * maxHeight;

    float avg=(h1+h2+h3+h4)/4;

    if(abs(h0-avg) > noiseVariance){
        return avg;
    }else return h0;
}


float h(float x, float y){
    if(noiseVersion==0){
        return max(waterHeight,texture(noise,vec2(x/200,y/200)).x * maxHeight);
    }
    else if(noiseVersion==1){
        return max(waterHeight,fbmSmoother(vec2(x,y),H,lacunarity,octaves));
    }
}

void main () {

    vec4 p = position;
    p.y = h(p.x,p.z);

    vec3 derX = vec3(p.x+1,h(p.x+1,p.z),p.z) - vec3(p.x-1,h(p.x-1,p.z), p.z);
    vec3 derY = vec3(p.x,h(p.x,p.z+1), p.z+1) - vec3(p.x,h(p.x,p.z-1), p.z-1);
    n= normalize(m_normal * normalize(cross(normalize(derY),normalize(derX))));
   
	tc = texCoord0;
    pos = p;
    

    float r = sqrt(pow(l_dir.x,2) + pow(l_dir.y,2) + pow(l_dir.z,2));
	float phi = atan((sqrt(pow(l_dir.x,2)+pow(l_dir.y,2)))/l_dir.z) + (time-12)/12*pi;
	float theta = atan(l_dir.y/l_dir.x);

    
    vec4 sunDir = vec4(r*sin(phi)*cos(theta), r*sin(phi)*sin(theta), r*cos(phi), 0);

    lDir = normalize(vec3(m_view * -normalize(sunDir)));

    gl_Position = m_pvm * p;

}