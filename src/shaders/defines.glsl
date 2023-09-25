uniform float u_Time;
uniform mat4 u_Model;
uniform mat4 u_View;
uniform mat4 u_Proj;

// fireball data
uniform float u_MainNoiseFreq;
uniform float u_SubNoiseFreq;

uniform float u_Radius;
uniform float u_Radiation;
uniform float u_RadiationPower;
uniform float u_Steps;

// camera
uniform vec3 u_CameraPos;
uniform float u_Far;
uniform float u_Near;

// misc
uniform float u_NDCDepth;

void get_ray(vec2 uv, out vec3 ro, out vec3 rd) {
	vec2 ndc = uv * 2.0 - 1.0;
	vec4 hndc = vec4(ndc, u_Near, 1.0);
	vec4 hp = inverse(u_Proj * u_View * u_Model) * hndc;
	vec3 p = hp.xyz / hp.w;
	ro = u_CameraPos;
	rd = normalize(p - ro); 
}

// toolbox functions
float ease_in(float t) {
	return t * t;
}
float ease_out(float t) {
	return 1.0 - ease_in(1.0 - t);
}
float ease_in_out(float t) {
	if(t < 0.5) return ease_in(t);
	else return 1.0 - ease_in((1.0 - t)* 2.0) / 2.0;
}
float bias(float x, float t) {
	return pow(t, log(t) / log(0.5));
}
float gain(float x, float t) {
	if(t < 0.5f)
		return bias(1.0-x, 2.0*t) / 2.0;
	else
		return 1.0 - bias(1.0-x, 2.0-2.0*t) / 2.0;
}
float pulse(float c, float w, float x) {
	x = abs(x-c);
	if(x > w) return 0.0;
	x /= w;
	return 1.0 - x * x * (3.0 - 2.0 * x);
}
float impulse(float k, float x) {
	float h = k * x;
	return h * exp(1.0 - h);
}
float parabola(float x, float k) {
	return pow(4.0 * x * (1.0 - x), k);
}
float exp_step(float x, float k, float n) {
    return exp(-k * pow(x, n));
}
float exp_smoothstep(float x, float k, float n) {
    return exp(-k * pow(x, n)) / (exp(-k) - 1.0);
}
float exp_in(float x, float k) {
    return exp(-k * x);
}
float exp_out(float x, float k) {
    return 1.0 - exp(-k * (1.0 - x));
}
float exp_in_out(float x, float k) {
    return x < 0.5 ? exp(2.0 * k * (x - 1.0)) / (exp(2.0 * k) - 1.0) : (exp(-2.0 * k * x) - 1.0) / (exp(-2.0 * k) - 1.0) * -0.5 + 0.5;
}
float pcurve(float x, float a, float b) {
	float k = pow(a+b, a+b) / (pow(a,a) * pow(b,b));
	return k * pow(x,a) * pow(1.0-x, b);
}
float triangle_wave(float x, float amp) {
	return abs(mod(x, amp) - (0.5 * amp));
}