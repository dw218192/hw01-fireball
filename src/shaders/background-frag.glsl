in vec2 fs_UV;

uniform samplerCube u_CubeMap;
out vec4 out_Color;

void main() {
    vec3 ro, rd;
    get_ray(fs_UV, ro, rd);
    out_Color = vec4(texture(u_CubeMap, rd).rgb, 1.0);
}