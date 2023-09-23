in vec2 fs_UV;
in vec4 fs_Pos;
out vec4 out_Color;

vec4 volumeMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    vec4 color = vec4(0.);
    for(int i = 0; i < int(u_Steps); i++) {
        vec3 p = ro + t * rd;
        float sdf = length(p) - u_Radius;
        float noise = fbm(p * 0.45 + u_Time * 0.45);
        noise = (noise + 0.7) / 3.;
        float density = pow(u_Radiation, -u_RadiationPower * sdf) * noise;

        if(density > 1e-3) {
            vec4 c = vec4(
                mix(
                    vec3(1.0, 0.19, 0.0), 
                    vec3(1.0, 0.91, 0.0),
                density), density);
            c.a *= 0.2;
            c.rgb *= c.a;
            color += c * (1.0 - color.a);
        }
        t += sdf;
    }
    return color;
}

vec4 rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for(int i = 0; i < 50; i++) {
        vec3 p = ro + t * rd;
        float sdf = length(p) - 1.;
        if (sdf < 0.01) {
            return vec4(1.0);
        }
        t += sdf;
    }
    return vec4(0.0);
}

void main() {
    vec2 ndc = fs_UV * 2.0 - 1.0;
    vec4 hndc = vec4(ndc, u_Near, 1.0);
    vec4 hp = inverse(u_Proj * u_View * u_Model) * hndc;
    vec3 p = hp.xyz / hp.w;
    vec3 ro = u_CameraPos;
    vec3 rd = normalize(p - ro); 
    out_Color = volumeMarch(ro, rd);
}